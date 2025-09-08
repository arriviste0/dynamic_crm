// src/ai/flows/suggest-workflow-destinations.ts
'use server';

/**
 * @fileOverview Suggests webhook destinations based on tenant preferences and rule context.
 *
 * - suggestWorkflowDestinations - A function that suggests webhook destinations.
 * - SuggestWorkflowDestinationsInput - The input type for the suggestWorkflowDestinations function.
 * - SuggestWorkflowDestinationsOutput - The return type for the suggestWorkflowDestinations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWorkflowDestinationsInputSchema = z.object({
  tenantPreferences: z
    .string()
    .describe(
      'A description of the tenant preferences, such as industry and integrations used.'
    ),
  ruleContext: z
    .string()
    .describe(
      'The context of the automation rule, including trigger, conditions, and desired actions.'
    ),
});
export type SuggestWorkflowDestinationsInput = z.infer<
  typeof SuggestWorkflowDestinationsInputSchema
>;

const SuggestWorkflowDestinationsOutputSchema = z.object({
  destinations: z
    .array(z.string())
    .describe(
      'An array of suggested webhook destination URLs based on the input parameters.'
    ),
});
export type SuggestWorkflowDestinationsOutput = z.infer<
  typeof SuggestWorkflowDestinationsOutputSchema
>;

export async function suggestWorkflowDestinations(
  input: SuggestWorkflowDestinationsInput
): Promise<SuggestWorkflowDestinationsOutput> {
  return suggestWorkflowDestinationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkflowDestinationsPrompt',
  input: {schema: SuggestWorkflowDestinationsInputSchema},
  output: {schema: SuggestWorkflowDestinationsOutputSchema},
  prompt: `You are an integration expert. Given the tenant preferences and the automation rule context, suggest webhook destination URLs that would be appropriate. Only return a JSON array of URL strings.

Tenant Preferences: {{{tenantPreferences}}}
Rule Context: {{{ruleContext}}}

Destinations:`,
});

const suggestWorkflowDestinationsFlow = ai.defineFlow(
  {
    name: 'suggestWorkflowDestinationsFlow',
    inputSchema: SuggestWorkflowDestinationsInputSchema,
    outputSchema: SuggestWorkflowDestinationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
