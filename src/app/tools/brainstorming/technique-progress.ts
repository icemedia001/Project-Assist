import { createTool } from '@iqai/adk';
import { z } from 'zod';

export const completeTechniqueTool = createTool({
  name: "complete_current_technique",
  description: "Mark current technique as complete and move to next",
  schema: z.object({
    techniqueName: z.string(),
    ideasGenerated: z.number(),
    summary: z.string().optional()
  }),
  fn: ({ techniqueName, ideasGenerated, summary }, context) => {
    const completed = context.state.get("techniques_completed", []);
    const selected = context.state.get("selected_techniques", []);
    const currentIndex = context.state.get("current_technique_index", 0);
    
    completed.push({
      technique: techniqueName,
      ideasGenerated,
      summary,
      timestamp: new Date().toISOString()
    });
    
    context.state.set("techniques_completed", completed);
    context.state.set("current_technique_index", currentIndex + 1);
    
    const hasMore = currentIndex + 1 < selected.length;
    const nextTechnique = hasMore ? selected[currentIndex + 1] : null;
    
    return {
      completedTechnique: techniqueName,
      totalCompleted: completed.length,
      totalSelected: selected.length,
      hasMoreTechniques: hasMore,
      nextTechnique,
      message: hasMore 
        ? `Completed ${techniqueName}. Ready for ${nextTechnique}?`
        : `All ${completed.length} techniques completed!`
    };
  }
});
