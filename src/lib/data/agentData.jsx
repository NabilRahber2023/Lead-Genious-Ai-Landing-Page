
import React from "react";
import { Users, ShoppingCart, CreditCard, TrendingUp, Mail, MessageSquare, Phone, Bot, Activity } from "lucide-react";

export const agentTypes = [
  {
    id: "customer-finder",
    name: "Prospector AI",
    description: "Scours data sources to unearth high-potential leads matching ideal customer profiles.",
    icon: <Users className="h-6 w-6 text-blue-400" />,
    capabilities: ["Deep Web Analysis", "Social Listening", "Behavioral Pattern Recognition"],
    effectiveness: 88,
    color: "bg-blue-500/10 border-blue-500",
    accent: "indigo"
  },
  {
    id: "cart-recovery",
    name: "Guardian AI",
    description: "Strategically re-engages customers who abandon carts, maximizing conversion.",
    icon: <ShoppingCart className="h-6 w-6 text-green-400" />,
    capabilities: ["Abandonment Prediction", "Dynamic Incentive Engine", "Automated Follow-ups"],
    effectiveness: 82,
    color: "bg-green-500/10 border-green-500",
    accent: "sky"
  },
  {
    id: "upsell-specialist",
    name: "Maximizer AI",
    description: "Intelligently identifies and presents upselling/cross-selling opportunities.",
    icon: <CreditCard className="h-6 w-6 text-purple-400" />,
    capabilities: ["Recommendation Engine", "Contextual Offer Generation", "Value Propositioning"],
    effectiveness: 85,
    color: "bg-purple-500/10 border-purple-500",
    accent: "violet"
  },
  {
    id: "trend-analyzer",
    name: "Oracle AI",
    description: "Analyzes market shifts and evolving customer preferences to guide strategy.",
    icon: <TrendingUp className="h-6 w-6 text-orange-400" />,
    capabilities: ["Predictive Analytics", "Sentiment Analysis", "Competitive Intelligence Mapping"],
    effectiveness: 92,
    color: "bg-orange-500/10 border-orange-500",
    accent: "cyan"
  },
  {
    id: "email-marketer",
    name: "Communicator AI",
    description: "Crafts and optimizes compelling email campaigns that resonate and convert.",
    icon: <Mail className="h-6 w-6 text-red-400" />,
    capabilities: ["Personalized Content Generation", "Advanced A/B/n Testing", "Engagement Scoring"],
    effectiveness: 78,
    color: "bg-red-500/10 border-red-500",
    accent: "emerald"
  },
  {
    id: "chat-agent",
    name: "Concierge AI",
    description: "Provides instant, intelligent chat support, guiding visitors towards conversion.",
    icon: <MessageSquare className="h-6 w-6 text-teal-400" />,
    capabilities: ["Natural Language Processing", "Knowledge Base Integration", "Proactive Engagement"],
    effectiveness: 90,
    color: "bg-teal-500/10 border-teal-500",
    accent: "amber"
  },
  {
    id: "outreach-agent",
    name: "Networker AI",
    description: "Automates and personalizes outbound prospecting for wider reach.",
    icon: <Phone className="h-6 w-6 text-indigo-400" />,
    capabilities: ["Automated Prospecting", "Smart Sequencing", "Relationship Nurturing"],
    effectiveness: 75,
    color: "bg-indigo-500/10 border-indigo-500",
    accent: "teal"
  },
  {
    id: "onboarding-specialist",
    name: "Pathfinder AI",
    description: "Guides new leads through a personalized onboarding journey for optimal engagement.",
    icon: <Bot className="h-6 w-6 text-cyan-400" />,
    capabilities: ["Personalized Onboarding Flows", "Resource Curation", "Early Success Identification"],
    effectiveness: 86,
    color: "bg-cyan-500/10 border-cyan-500",
    accent: "rose"
  },
  {
    id: "retention-catalyst",
    name: "Loyalty AI",
    description: "Proactively identifies and addresses churn risks, fostering long-term customer loyalty.",
    icon: <Activity className="h-6 w-6 text-pink-400" />,
    capabilities: ["Churn Prediction", "Personalized Retention Offers", "Feedback Loop Management"],
    effectiveness: 89,
    color: "bg-pink-500/10 border-pink-500",
    accent: "slate"
  }
];

export const agentResponses = {
  "customer-finder": [
    "Identified 22 high-intent prospects matching our 'Enterprise SaaS' profile.",
    "Cross-referenced social media activity; 7 prospects recently engaged with competitor content.",
    "Suggesting a personalized outreach sequence highlighting our unique differentiators.",
    "Shall I add these prospects to the 'High-Priority Outreach' campaign?"
  ],
  "cart-recovery": [
    "Detected 9 abandoned carts in the last hour, total value $1,250.",
    "Guardian AI has initiated a multi-touch recovery sequence with a time-sensitive 10% discount.",
    "One cart recovered already! Customer 'Jane Doe' completed a $150 purchase.",
    "Analyzing abandonment reasons... Most seem to be related to shipping costs."
  ],
  "upsell-specialist": [
    "Customer 'John B.' (purchased 'Basic Plan') is a strong candidate for 'Pro Plan' upgrade.",
    "Maximizer AI suggests highlighting the 'Advanced Analytics' feature of the Pro Plan.",
    "Drafted a personalized email showcasing Pro Plan benefits tailored to John's usage patterns.",
    "Would you like to review and approve the upsell communication?"
  ],
  "trend-analyzer": [
    "Oracle AI reports a 30% surge in online searches for 'AI-powered CRM integration'.",
    "Competitor 'SalesForce' just launched a new AI feature; sentiment is mixed.",
    "Recommend prioritizing development of our own enhanced AI integration features.",
    "Full trend report and competitive analysis available in your inbox."
  ],
  "email-marketer": [
    "The 'New Feature Showcase' campaign achieved a 28% open rate and 4.5% CTR.",
    "Communicator AI's A/B test indicates Subject Line B (with emoji) performed 15% better.",
    "Segmenting non-openers for a follow-up campaign with a different value proposition.",
    "Preparing a new campaign for 'Webinar Registrations' - want to set goals?"
  ],
  "chat-agent": [
    "Concierge AI handled 58 conversations today, 25 escalated to human agents.",
    "Successfully qualified 12 new leads through proactive chat engagement on the pricing page.",
    "Most common query: 'Does your Enterprise plan support SSO?' Updating knowledge base.",
    "Feedback: Visitors appreciate the instant answers. Average satisfaction score: 4.7/5."
  ],
  "outreach-agent": [
    "Networker AI sent 150 personalized connection requests on LinkedIn today.",
    "Achieved a 25% acceptance rate. 10 new conversations initiated.",
    "Scheduling follow-up calls for 3 warm leads identified through engagement tracking.",
    "Expanding outreach to 'Fintech Startups' segment next week."
  ],
  "onboarding-specialist": [
    "Pathfinder AI has initiated onboarding for 7 new sign-ups today.",
    "Identified 'User X' struggling with feature Y. Proactively sent a tutorial video.",
    "Two users have completed the 'Quick Start' milestone. Congrats!",
    "Gathering feedback on the onboarding flow. Initial responses are positive."
  ],
  "retention-catalyst": [
    "Loyalty AI flagged 3 accounts with high churn risk based on decreased activity.",
    "Initiated personalized re-engagement campaigns for these accounts.",
    "Customer 'Acme Corp' responded positively to a special offer, averting churn.",
    "Analyzing feedback from exited customers to identify improvement areas."
  ]
};

export const getAgentById = (agentId) => {
  return agentTypes.find(agent => agent.id === agentId);
};
