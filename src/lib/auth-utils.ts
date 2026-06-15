/**
 * Utility functions for user authentication, identifier parsing, and shadow email resolution.
 */

export interface ParsedIdentifier {
  email: string;
}

export function parseIdentifier(input: string): ParsedIdentifier {
  const cleanInput = input.trim().toLowerCase();
  
  return {
    email: cleanInput
  };
}
