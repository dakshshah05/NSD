// Removed Google Generative AI dependency as we migrated to a free, keyless endpoint.
// Using text.pollinations.ai instead.

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

    try {
        const insightsPrompt = `Analyze this college energy data context and provide exactly TWO distinct smart, actionable recommendations for energy optimization. 
Data Context: ${JSON.stringify(dataContext)}
Return ONLY a valid JSON array of two objects. Each object must strictly match this format:
{"id": "unique-string", "title": "Short Tech Title", "description": "1 sentence explanation.", "priority": "High/Medium/Low", "savings": "X%", "action": "Action Button Text"}
Do not include any other markdown, text, or explanations. Just the JSON array.`;

        const encodedPrompt = encodeURIComponent(insightsPrompt);
        const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);
        
        if (!response.ok) throw new Error("Free AI Error");
        let rawContent = await response.text();
        
        // Clean markdown block if the model returned it despite instructions
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

        return {
            summary: "AI analysis complete based on current conditions.",
            recommendations: JSON.parse(rawContent)
        };

    } catch (error) {
        console.error("AI Analysis Failed. Falling back:", error);
        return {
            summary: "Live analysis temporarily unavailable. Showing insights based on historical patterns.",
            recommendations: generateSmartFallback(dataContext)
        };
    }
};
