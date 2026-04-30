const mongoose = require('mongoose');
const Internship = require('./models/Internship');

// Connect to Database
mongoose.connect('mongodb://localhost:27017/internship_allocation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB for Seeding'))
.catch(err => console.error('MongoDB connection error:', err));

const companies = [
  "Google", "Apple", "Microsoft", "Meta", "Amazon", "Netflix", "SpaceX", 
  "Tesla", "Stripe", "Airbnb", "Uber", "Lyft", "Pinterest", "Slack", "Zoom", 
  "Spotify", "Twitter (X)", "ByteDance", "NVIDIA", "AMD", "Intel", "IBM", 
  "Salesforce", "Adobe", "Oracle", "Cisco", "Palantir", "Databricks", "Snowflake",
  "Coinbase", "Robinhood", "Plaid", "Brex", "Notion", "Figma", "Canva",
  "Rippling", "Discord", "OpenAI", "Anthropic", "Scale AI", "Hugging Face"
];

const titles = [
  "Software Engineering Intern", "Machine Learning Intern", "Data Science Intern",
  "Frontend Developer Intern", "Backend Engineer Intern", "Full Stack Intern",
  "Product Management Intern", "UX/UI Design Intern", "Systems Engineering Intern",
  "Cybersecurity Intern", "Cloud Infrastructure Intern", "DevOps Engineering Intern",
  "Quantitative Analyst Intern", "Hardware Engineering Intern", "Research Scientist Intern",
  "Blockchain Developer Intern", "Mobile App Developer (iOS/Android) Intern", "Game Developer Intern"
];

const locations = [
  "San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX", "London, UK",
  "Remote", "Remote (US Only)", "Remote (Global)", "Toronto, Canada", "Berlin, Germany",
  "Bangalore, India", "Singapore", "Sydney, Australia", "Boston, MA", "Chicago, IL",
  "Los Angeles, CA", "Denver, CO", "Atlanta, GA", "Miami, FL", "Vancouver, BC"
];

const durations = ["10 Weeks", "12 Weeks", "3 Months", "6 Months", "Summer 2026"];

const stipends = [
  "$8,000/month", "$9,000/month", "$10,000/month", "$11,500/month", "$7,500/month",
  "$45/hour", "$50/hour", "$60/hour", "$65/hour", "$55/hour",
  "$10,000 + Housing", "$12,000/month (Prorated)", "Competitive + Relocation"
];

const departments = [
  "Engineering", "Data & AI", "Product", "Design", "Research", "Security", "Infrastructure"
];

const reqPool = [
  "Currently pursuing a BS/MS/PhD in Computer Science or related degree",
  "Strong foundation in data structures, algorithms, and software design",
  "Proficiency in Python, Java, C++, or JavaScript/TypeScript",
  "Experience with React, Vue, or Angular",
  "Experience with Node.js, Express, or Django",
  "Understanding of building RESTful or GraphQL APIs",
  "Excellent problem-solving skills and ability to learn quickly",
  "Experience with PyTorch, TensorFlow, or deep learning architectures",
  "Knowledge of containerization (Docker/Kubernetes)",
  "Strong communication skills and ability to work in a collaborative environment",
  "Familiarity with cloud platforms (AWS, GCP, or Azure)",
  "History of open-source contributions or personal projects"
];

const verbStarters = [
  "Collaborate with senior engineers to", "Design, build, and maintain",
  "Optimize performance and scale", "Develop innovative solutions for",
  "Implement cutting-edge AI models for", "Lead architectural improvements in",
  "Prototype new user experiences for"
];

const targets = [
  "our core distributed systems.", "high-traffic user interfaces.",
  "internal machine learning platforms.", "next-generation mobile applications.",
  "crucial data processing pipelines.", "secure cloud infrastructure operations."
];

function getRandomElements(array, count) {
  const shuffled = array.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const seedInternships = async () => {
    try {
        console.log('Clearing existing mock data...');
        await Internship.deleteMany({});
        console.log('✅ Collection cleared');

        const internships = [];
        const requiredCount = 1000;
        
        console.log(`Generating ${requiredCount} highly realistic internships...`);
        
        for(let i=0; i < requiredCount; i++) {
            const company = getRandom(companies);
            const title = getRandom(titles);
            
            // Generate a dynamic realistic description
            const desc = `Join ${company} as a ${title}. You will ${getRandom(verbStarters)} ${getRandom(targets)} Our internship program is designed to provide you with real-world experience, mentorship from industry leaders, and the opportunity to make a tangible impact on products used by millions worldwide.`;

            // Pick 3 to 5 random requirements
            const requirements = getRandomElements(reqPool, Math.floor(Math.random() * 3) + 3);

            let deadlineDate = new Date();
            deadlineDate.setDate(deadlineDate.getDate() + Math.random() * 100);

            internships.push({
                title: title,
                company: company,
                description: desc,
                requirements: requirements,
                location: getRandom(locations),
                duration: getRandom(durations),
                stipend: getRandom(stipends),
                department: getRandom(departments),
                slots: Math.floor(Math.random() * 15) + 2, // 2 to 16 slots
                deadline: deadlineDate,
                isActive: true
            });
        }

        // Insert in bulk
        await Internship.insertMany(internships);
        
        console.log(`🎉 Successfully seeded ${requiredCount} realistic internships!`);
        console.log("Exiting...");
        process.exit();

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

// Run the seeder
seedInternships();
