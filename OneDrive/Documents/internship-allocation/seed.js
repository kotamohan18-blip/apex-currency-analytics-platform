const mongoose = require('mongoose');
const Internship = require('./models/Internship');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_allocation';

async function seedData() {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected correctly.');

        // Clear existing undefined or junk internships
        await Internship.deleteMany({});
        console.log('Cleared existing internships');

        const realInternships = [
            {
                title: 'Software Engineering Intern',
                company: 'Google',
                location: 'Mountain View, CA (Hybrid)',
                duration: '12 Weeks',
                stipend: '$8,500/month',
                description: 'Join the Google Cloud team to build scalable infrastructure and tools. You will work extensively with distributed systems, large scale databases, and networking.',
                requirements: ['C++', 'Go', 'Python', 'Data Structures'],
                slots: 5,
                isActive: true
            },
            {
                title: 'Machine Learning Intern',
                company: 'OpenAI',
                location: 'San Francisco, CA',
                duration: '16 Weeks',
                stipend: '$10,000/month',
                description: 'Contribute to advancing AGI by training large language models. Research optimizations for transformer architectures.',
                requirements: ['PyTorch', 'Python', 'Linear Algebra'],
                slots: 3,
                isActive: true
            },
            {
                title: 'Frontend Developer Intern',
                company: 'Vercel',
                location: 'Remote',
                duration: '10 Weeks',
                stipend: '$6,000/month',
                description: 'Work on cutting edge React frameworks. Help build Next.js features and craft visually stunning user interfaces.',
                requirements: ['React', 'Next.js', 'TailwindCSS'],
                slots: 8,
                isActive: true
            },
            {
                title: 'Data Science Intern',
                company: 'Netflix',
                location: 'Los Gatos, CA',
                duration: '12 Weeks',
                stipend: '$7,800/month',
                description: 'Analyze viewer data to improve content recommendation algorithms. Present findings to executive teams.',
                requirements: ['SQL', 'Python', 'Pandas'],
                slots: 4,
                isActive: true
            },
            {
                title: 'Backend Engineer Intern',
                company: 'Stripe',
                location: 'New York, NY',
                duration: '12 Weeks',
                stipend: '$9,200/month',
                description: 'Develop highly reliable financial APIs. Work on reducing latency for international transactions.',
                requirements: ['Ruby', 'Go', 'API Design'],
                slots: 2,
                isActive: true
            },
            {
                title: 'Product Design Intern (UI/UX)',
                company: 'Apple',
                location: 'Cupertino, CA',
                duration: '6 Months',
                stipend: '$7,500/month + Housing',
                description: 'Design features for iOS and macOS. Collaborate with engineering to bring prototypes to life.',
                requirements: ['Figma', 'Prototyping', 'SwiftUI knowledge is a plus'],
                slots: 5,
                isActive: true
            }
        ];

        await Internship.insertMany(realInternships);
        console.log(`Successfully seeded ${realInternships.length} real internships!`);
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedData();
