/**
 * Prüft, ob eine Farbe (hex) dunkel ist.
 */
export function isDarkColor(hex: string): boolean {
	// hex zu rgb
	const c = hex.replace('#', '');
	const r = parseInt(c.substring(0, 2), 16);
	const g = parseInt(c.substring(2, 4), 16);
	const b = parseInt(c.substring(4, 6), 16);
	// Helligkeit berechnen (Standard-Luma-Formel)
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness < 128; // true = dunkel, false = hell
}
