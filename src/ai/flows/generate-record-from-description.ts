'use server';

/**
 * @fileOverview A flow to generate a record from a natural language description.
 *
 * - generateRecordFromDescription - A function that generates a record from a description.
 * - GenerateRecordFromDescriptionInput - The input type for the generateRecordFromDescription function.
 * - GenerateRecordFromDescriptionOutput - The return type for the generateRecordFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecordFromDescriptionInputSchema = z.object({
  objectApiName: z.string().describe('The API name of the object to create a record for.'),
  description: z.string().describe('A natural language description of the record to create.'),
});
export type GenerateRecordFromDescriptionInput = z.infer<typeof GenerateRecordFromDescriptionInputSchema>;

const GenerateRecordFromDescriptionOutputSchema = z.record(z.any()).describe('A record containing the fields and their values.');
export type GenerateRecordFromDescriptionOutput = z.infer<typeof GenerateRecordFromDescriptionOutputSchema>;

export async function generateRecordFromDescription(
  input: GenerateRecordFromDescriptionInput
): Promise<GenerateRecordFromDescriptionOutput> {
  return generateRecordFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecordFromDescriptionPrompt',
  input: {schema: GenerateRecordFromDescriptionInputSchema},
  output: {schema: GenerateRecordFromDescriptionOutputSchema},
  prompt: `You are an expert CRM assistant. You will generate a record for the object {{objectApiName}} based on the following description: {{description}}.

Ensure that the output is a JSON object containing the fields and their values for the record. Only output the JSON, do not include any additional text.`,
});

const generateRecordFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateRecordFromDescriptionFlow',
    inputSchema: GenerateRecordFromDescriptionInputSchema,
    outputSchema: GenerateRecordFromDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
