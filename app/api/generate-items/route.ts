import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, category, equipmentSlot } = body;
    
    // Check if we have an OpenAI API key configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('No OpenAI API key found in environment variables.');
    }
    
    console.log('Generating items with OpenAI...');
    console.log('Prompt:', prompt);
    
    try {
      // Make the API call to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a creative assistant specialized in creating fantasy game items for a Dungeon Crawler game. Generate detailed and unique items with balanced stats. Your response MUST be in JSON format with the following structure: { \"items\": [array of 10 item objects] }. Each item in the array must have these properties: name (string), description (string), flavorText (string), categories (string array), equipSlot (string, optional), damage (string, for weapons), armorClass (number, for armor), value (number), weight (number)."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      });
      
      const response = completion.choices[0]?.message.content || '';
      console.log('OpenAI response:', response);
      
      // Parse the generated items from the response
      try {
        const parsedResponse = JSON.parse(response);
        
        // Handle case where we got a single item instead of an array
        if (!Array.isArray(parsedResponse) && !parsedResponse.items) {
          // Convert single object to array with one item
          console.log('Received single item response, converting to array');
          const singleItem = parsedResponse;
          
          // Create array with 10 copies (or variations) of this item
          const generatedItems = Array(10).fill(0).map((_, i) => ({
            name: singleItem.name || `Unnamed Item ${i+1}`,
            description: singleItem.description || 'No description available.',
            flavorText: singleItem.flavorText || '',
            categories: Array.isArray(singleItem.categories) ? singleItem.categories : [category],
            ...(singleItem.equipSlot && { equipSlot: singleItem.equipSlot }),
            ...(singleItem.damage && { damage: singleItem.damage }),
            ...(singleItem.armorClass !== undefined && { armorClass: singleItem.armorClass }),
            value: singleItem.value || 0,
            weight: singleItem.weight || 1
          }));
          
          return NextResponse.json({ 
            items: generatedItems,
            message: "Items generated based on single template from OpenAI"
          });
        }
        
        // Normal case - extract the items array
        let generatedItems = Array.isArray(parsedResponse) 
          ? parsedResponse 
          : parsedResponse.items || [];
          
        // If we somehow got no items or the wrong format, extract JSON array from text
        if (!generatedItems || generatedItems.length === 0) {
          const jsonMatch = response.match(/\[.*\]/s);
          if (jsonMatch) {
            generatedItems = JSON.parse(jsonMatch[0]);
          } else {
            console.warn('Could not extract items from OpenAI response');
          }
        }
        
        // Ensure we have items and they have the correct properties
        if (generatedItems && generatedItems.length > 0) {
          // Validate and fix each item to ensure they have the required properties
          interface Item {
            name: string;
            description: string;
            flavorText: string;
            categories: string[];
            equipSlot?: string;
            damage?: string;
            armorClass?: number;
            value: number;
            weight: number;
          }

          const validatedItems: Item[] = generatedItems.map((item: Partial<Item>) => ({
            name: item.name || 'Unnamed Item',
            description: item.description || 'No description available.',
            flavorText: item.flavorText || '',
            categories: Array.isArray(item.categories) ? item.categories : [category],
            ...(item.equipSlot && { equipSlot: item.equipSlot }),
            ...(item.damage && { damage: item.damage }),
            ...(item.armorClass !== undefined && { armorClass: item.armorClass }),
            value: item.value || 0,
            weight: item.weight || 1
          }));
          
          console.log('Successfully generated items with OpenAI');
          
          return NextResponse.json({ 
            items: validatedItems,
            message: "Items generated successfully with OpenAI"
          });
        } else {
          throw new Error('No valid items found in response');
        }
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
      }
      
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
    }
    
  } catch (error) {
    console.error('Error generating items:', error);
    return NextResponse.json(
      { error: 'Failed to generate items' },
      { status: 500 }
    );
  }
}