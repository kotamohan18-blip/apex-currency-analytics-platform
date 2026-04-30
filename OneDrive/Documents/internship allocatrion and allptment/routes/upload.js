const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `resume-${req.session.userId}-${uniqueSuffix}${ext}`);
    }
});

// File filter for resumes (PDF, DOC, DOCX)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Not logged in' });
};

// Upload resume
router.post('/resume', isAuthenticated, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const originalName = req.file.originalname;
        const fileSize = req.file.size;
        
        let resumeText = '';
        let extractedData = {};
        
        // Parse resume content if it's a PDF
        if (path.extname(originalName).toLowerCase() === '.pdf') {
            try {
                const dataBuffer = await fs.readFile(filePath);
                const pdfData = await pdfParse(dataBuffer);
                resumeText = pdfData.text;
                
                // Extract basic information from resume text
                extractedData = extractResumeInfo(resumeText);
            } catch (parseError) {
                console.error('PDF parsing error:', parseError);
                // Continue without parsing if it fails
            }
        }
        
        // Save file info to database
        await req.db.run(
            'INSERT INTO resume_uploads (user_id, file_path, original_name, file_size, extracted_text, extracted_data) VALUES (?, ?, ?, ?, ?, ?)',
            [req.session.userId, filePath, originalName, fileSize, resumeText, JSON.stringify(extractedData)]
        );
        
        return res.json({
            success: true,
            message: 'Resume uploaded successfully',
            file: {
                id: req.file.filename,
                originalName: originalName,
                size: fileSize,
                path: filePath,
                extractedData: extractedData
            }
        });
        
    } catch (error) {
        console.error('Resume upload error:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupError) {
                console.error('File cleanup error:', cleanupError);
            }
        }
        
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to upload resume' 
        });
    }
});

// Get uploaded resumes
router.get('/resumes', isAuthenticated, async (req, res) => {
    try {
        const resumes = await req.db.all(`
            SELECT id, original_name, file_size, upload_date, extracted_data
            FROM resume_uploads 
            WHERE user_id = ?
            ORDER BY upload_date DESC
        `, [req.session.userId]);
        
        const formattedResumes = resumes.map(row => ({
            id: row.id,
            originalName: row.original_name,
            fileSize: row.file_size,
            uploadDate: row.upload_date,
            extractedData: row.extracted_data ? JSON.parse(row.extracted_data) : {}
        }));
        
        return res.json({ success: true, resumes: formattedResumes });
    } catch (error) {
        console.error('Get resumes error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch resumes' });
    }
});

// Download resume
router.get('/resume/:id', isAuthenticated, async (req, res) => {
    try {
        const resumeId = req.params.id;
        
        const resume = await req.db.get(
            'SELECT file_path, original_name FROM resume_uploads WHERE id = ? AND user_id = ?',
            [resumeId, req.session.userId]
        );
        
        if (!resume) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }
        
        // Check if file exists
        try {
            await fs.access(resume.file_path);
        } catch (error) {
            return res.status(404).json({ success: false, message: 'Resume file not found' });
        }
        
        res.download(resume.file_path, resume.original_name);
    } catch (error) {
        console.error('Download resume error:', error);
        return res.status(500).json({ success: false, message: 'Failed to download resume' });
    }
});

// Delete resume
router.delete('/resume/:id', isAuthenticated, async (req, res) => {
    try {
        const resumeId = req.params.id;
        
        const resume = await req.db.get(
            'SELECT file_path FROM resume_uploads WHERE id = ? AND user_id = ?',
            [resumeId, req.session.userId]
        );
        
        if (!resume) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }
        
        // Delete file from filesystem
        try {
            await fs.unlink(resume.file_path);
        } catch (error) {
            console.error('File deletion error:', error);
            // Continue even if file deletion fails
        }
        
        // Delete from database
        await req.db.run('DELETE FROM resume_uploads WHERE id = ? AND user_id = ?', [resumeId, req.session.userId]);
        
        return res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Delete resume error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete resume' });
    }
});

// Parse resume text and extract information
function extractResumeInfo(text) {
    const extracted = {
        email: '',
        phone: '',
        skills: [],
        experience: [],
        education: []
    };
    
    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
        extracted.email = emails[0];
    }
    
    // Extract phone number
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
        extracted.phone = phones[0];
    }
    
    // Extract skills (common technical skills)
    const commonSkills = [
        'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'HTML', 'CSS',
        'SQL', 'MongoDB', 'Express', 'Angular', 'Vue.js', 'TypeScript', 'Git',
        'Docker', 'AWS', 'Azure', 'Machine Learning', 'Data Science', 'REST API',
        'GraphQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Kubernetes',
        'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'Unit Testing', 'Integration Testing'
    ];
    
    commonSkills.forEach(skill => {
        if (text.toLowerCase().includes(skill.toLowerCase())) {
            extracted.skills.push(skill);
        }
    });
    
    // Extract education (basic pattern matching)
    const educationPatterns = [
        /Bachelor [A-Za-z]+/gi,
        /Master [A-Za-z]+/gi,
        /PhD [A-Za-z]+/gi,
        /B\.[A-Za-z]+/gi,
        /M\.[A-Za-z]+/gi,
        /University/gi,
        /College/gi
    ];
    
    educationPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            extracted.education.push(...matches);
        }
    });
    
    // Remove duplicates
    extracted.skills = [...new Set(extracted.skills)];
    extracted.education = [...new Set(extracted.education)];
    
    return extracted;
}

// Create resume_uploads table if it doesn't exist
const createResumeTable = async (db) => {
    try {
        await db.run(`
            CREATE TABLE IF NOT EXISTS resume_uploads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                file_path TEXT NOT NULL,
                original_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                extracted_text TEXT,
                extracted_data TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);
    } catch (error) {
        console.error('Error creating resume_uploads table:', error);
    }
};

module.exports = { router, createResumeTable };
