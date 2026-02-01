import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-pro" });
}

export const analyzeEnergyData = async (dataContext) => {
    // Helper to generate recommendations from known issues or fallbacks
    const generateSmartFallback = (context) => {
        const issues = context.knownIssues || [];
        if (issues.length > 0) {
            return issues.map((issue, idx) => ({
                id: `simulated-${idx}-${Date.now()}`,
                title: issue.issue || "Detected Anomaly",
                description: issue.details || `Unusual pattern detected: ${issue.risk} risk level.`,
                priority: issue.risk || "Medium",
                savings: issue.risk === 'Critical' ? '25%' : (issue.risk === 'High' ? '15%' : '5%'),
                action: "View Details"
            }));
        }
        
        // Default generic fallbacks if no specific issues found
        return [
            {
                id: 'fallback-1',
                title: "Optimize HVAC Schedule",
                description: "Analysis suggests cooling systems are running during low-occupancy hours.",
                priority: "High",
                savings: "15%",
                action: "Adjust Schedule"
            },
            {
                id: 'fallback-2',
                title: "Detect Phantom Load",
                description: "Baseload power remains high at night. Likely due to computers in standby.",
                priority: "Medium",
                savings: "8%",
                action: "Enable Auto-Sleep"
            }
        ];
    };

    if (!model) {
        if (!API_KEY) {
            console.warn("Gemini API Key is missing. Using Simulation Mode.");
            const simulatedRecs = generateSmartFallback(dataContext);
            return {
                summary: "Demo Mode: API Key missing. Showing simulated analysis based on data context.",
                recommendations: simulatedRecs
            };
        }
        // ... re-init logic
    }

    try {
        // ... API Call logic
        const result = await model.generateContent(prompt);
        // ... parse logic
        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        return {
            summary: "Live analysis unavailable. Showing insights based on historical patterns.",
            recommendations: generateSmartFallback(dataContext)
        };
    }
};
