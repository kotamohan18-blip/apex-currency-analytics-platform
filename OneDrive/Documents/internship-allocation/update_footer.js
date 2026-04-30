const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'public');
const files = ['dashboard.html', 'profile.html', 'internships.html', 'applications.html'];

files.forEach(file => {
    const filePath = path.join(directoryPath, file);
    if(fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Ensure Legal & Support links point properly
        content = content.replace(/href="#" class="hover:text-(brand|blue)-400 transition-colors">Privacy Directive<\/a>/g, 'href="/privacy.html" class="hover:text-$1-400 transition-colors">Privacy Directive</a>');
        content = content.replace(/href="#" class="hover:text-(brand|blue)-400 transition-colors">Terms of Access<\/a>/g, 'href="/terms.html" class="hover:text-$1-400 transition-colors">Terms of Access</a>');
        content = content.replace(/href="#" class="hover:text-(brand|blue)-400 transition-colors">Contact Command<\/a>/g, 'href="/contact.html" class="hover:text-$1-400 transition-colors">Contact Command</a>');

        // Social links
        content = content.replace(/href="#" class="hover:text-white transition-colors"><i class="fab fa-twitter"><\/i><\/a>/g, 'href="https://twitter.com/InternHub" target="_blank" class="hover:text-blue-400 transition-colors"><i class="fab fa-twitter"></i></a>');
        content = content.replace(/href="#" class="hover:text-white transition-colors"><i class="fab fa-github"><\/i><\/a>/g, 'href="https://github.com" target="_blank" class="hover:text-gray-400 transition-colors"><i class="fab fa-github"></i></a>');
        content = content.replace(/href="#" class="hover:text-white transition-colors"><i class="fab fa-linkedin"><\/i><\/a>/g, 'href="https://linkedin.com" target="_blank" class="hover:text-blue-600 transition-colors"><i class="fab fa-linkedin"></i></a>');

        fs.writeFileSync(filePath, content);
    }
});
console.log('Successfully updated footer links in all HTML files!');
