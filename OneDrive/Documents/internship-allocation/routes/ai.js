const express = require('express');
const router = express.Router();

// Smart rule-based chatbot responses for InternHub
function getSmartResponse(prompt) {
  const p = prompt.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|hiya|howdy|sup|what'?s up)/.test(p)) {
    return "Hey! 👋 Welcome to InternHub. I'm your AI career assistant. I can help you with:\n• Finding internships\n• Profile tips\n• Application strategies\n• Resume advice\n\nWhat would you like to know?";
  }

  // Internship search
  if (p.includes('find intern') || p.includes('search intern') || p.includes('available intern') || p.includes('browse intern')) {
    return "🔍 To find internships:\n1. Go to the **Internships** page from the nav bar\n2. Browse all available roles\n3. Click **Apply Now** on any role you like\n4. Track your application in the Applications page\n\nWe have roles in tech, marketing, finance, and more!";
  }

  // Application status
  if (p.includes('application') && (p.includes('status') || p.includes('check') || p.includes('track'))) {
    return "📋 You can track all your applications in the **Applications** page. Each application shows:\n• Company name & role\n• Date applied\n• Status: Pending / Approved / Rejected\n\nYour confirmed placement will appear on your **Profile** page.";
  }

  // Profile tips
  if (p.includes('profile') || p.includes('improve') || p.includes('optimize')) {
    return "✨ **Profile Optimization Tips:**\n• Add your full name and institution\n• List your top skills (React, Python, etc.)\n• Keep your department/sector updated\n• Add relevant experience in skills\n\nA complete profile increases your match rate by 3x!";
  }

  // Resume advice
  if (p.includes('resume') || p.includes('cv')) {
    return "📄 **Resume Tips for Interns:**\n• Keep it to 1 page\n• Lead with your skills & projects\n• Quantify achievements (e.g., '20% faster')\n• Include GitHub/portfolio links\n• Tailor it to each role\n\nMake sure your profile skills section matches your resume!";
  }

  // Skills
  if (p.includes('skill') || p.includes('learn') || p.includes('tech stack')) {
    return "💡 **Top Skills in Demand (2026):**\n• Frontend: React, Next.js, TypeScript\n• Backend: Node.js, Python, FastAPI\n• Data: SQL, Pandas, Power BI\n• AI/ML: LangChain, HuggingFace\n• DevOps: Docker, GitHub Actions\n\nAdd your skills to your profile to get better matches!";
  }

  // How to apply
  if (p.includes('how to apply') || p.includes('apply for') || p.includes('apply to')) {
    return "🚀 **How to Apply for an Internship:**\n1. Browse the **Internships** page\n2. Read the role description carefully\n3. Click the green **Apply Now** button\n4. Your application is submitted instantly!\n5. Track status in **Applications** page\n\nTip: Apply to 3-5 roles to maximize your chances!";
  }

  // Interview tips
  if (p.includes('interview')) {
    return "🎯 **Internship Interview Tips:**\n• Research the company beforehand\n• Prepare 2-3 projects to talk about\n• Know your tech stack deeply\n• Ask smart questions at the end\n• Follow up with a thank-you email\n\nPractice your intro: 'Tell me about yourself' is always first!";
  }

  // Salary / stipend
  if (p.includes('salary') || p.includes('stipend') || p.includes('paid') || p.includes('money')) {
    return "💰 **Internship Compensation:**\nStipends vary by role and company. Typical ranges:\n• Entry level tech: ₹5,000–₹15,000/mo\n• Mid-tier companies: ₹15,000–₹30,000/mo\n• Top MNCs: ₹30,000–₹60,000/mo\n\nCheck the stipend listed on each internship card in the Internships page!";
  }

  // Logout / login help
  if (p.includes('logout') || p.includes('log out') || p.includes('sign out')) {
    return "👋 To log out, click the **Logout** button in the top-right corner of the navigation bar. Your session will be cleared safely.";
  }

  if (p.includes('login') || p.includes('log in') || p.includes('sign in') || p.includes('password')) {
    return "🔐 Having trouble logging in?\n• Make sure you're using the email you registered with\n• Use the **Forgot Password** link on the login page to reset via OTP\n• OTP is sent to your email and expires in 5 minutes\n\nStill stuck? Contact support@internhub.dev";
  }

  // Allocation
  if (p.includes('allocation') || p.includes('assigned') || p.includes('placed') || p.includes('selected')) {
    return "🎉 **Internship Allocation:**\nWhen a recruiter selects you, your placement will show up in the **Confirmed Mission** section on your **Profile** page.\n\nYou'll see the company name, role, location, and start date. Keep your profile updated to improve your chances of selection!";
  }

  // Contact / help
  if (p.includes('contact') || p.includes('support') || p.includes('help') || p.includes('issue') || p.includes('problem')) {
    return "🆘 **Need Help?**\nVisit the **Contact** page or reach out directly:\n• Support: support@internhub.dev\n• Enterprise: corporate@internhub.dev\n\nOur team responds within 24 hours. You can also use this chatbot for instant answers!";
  }

  // Thank you
  if (p.includes('thank') || p.includes('thanks') || p.includes('great') || p.includes('awesome') || p.includes('perfect')) {
    return "😊 Happy to help! Good luck with your internship journey. Remember — consistency and a strong profile go a long way.\n\nFeel free to ask me anything else!";
  }

  // What can you do
  if (p.includes('what can you') || p.includes('what do you') || p.includes('help me') || p.includes('capabilities')) {
    return "🤖 **I can help you with:**\n• Finding and applying for internships\n• Profile & resume optimization tips\n• Application tracking guidance\n• Interview preparation advice\n• Understanding stipends & roles\n• Platform navigation\n• Login/account issues\n\nJust type your question and I'll guide you!";
  }

  // Default fallback
  const fallbacks = [
    "🤔 That's a good question! For specific queries about InternHub, try:\n• **'How do I apply?'** — Application guide\n• **'Profile tips'** — Improve your profile\n• **'Find internships'** — Browse roles\n• **'Interview tips'** — Ace your interviews\n\nOr visit the Contact page for direct support.",
    "💬 I'm focused on internship guidance! Try asking me about:\n• Applications & tracking\n• Profile optimization\n• Skill recommendations\n• How allocations work\n\nI'm here to help you land that internship! 🚀",
    "🌐 I specialize in InternHub platform help. You can ask me:\n• 'How to find internships?'\n• 'What skills should I add?'\n• 'How does allocation work?'\n• 'Resume tips'\n\nWhat would you like to know?"
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// POST /api/ai/generate - Chat endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Simulate a tiny processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));

    const text = getSmartResponse(prompt);

    return res.json({ success: true, text });

  } catch (error) {
    console.error('AI generate error:', error);
    return res.status(500).json({ success: false, message: 'Chatbot error. Please try again.' });
  }
});

module.exports = router;
