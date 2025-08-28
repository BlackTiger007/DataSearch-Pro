import { settings } from '$lib/stores/settings.svelte';

// enums/encodings.ts
export enum TextEncoding {
	UTF8 = 'utf-8',
	UTF16LE = 'utf-16le',
	ISO8859_1 = 'iso-8859-1',
	ISO8859_2 = 'iso-8859-2',
	ISO8859_3 = 'iso-8859-3',
	ISO8859_4 = 'iso-8859-4',
	ISO8859_5 = 'iso-8859-5',
	ISO8859_6 = 'iso-8859-6',
	ISO8859_7 = 'iso-8859-7',
	ISO8859_8 = 'iso-8859-8',
	ISO8859_10 = 'iso-8859-10',
	ISO8859_13 = 'iso-8859-13',
	ISO8859_14 = 'iso-8859-14',
	ISO8859_15 = 'iso-8859-15',
	KOI8_R = 'koi8-r',
	KOI8_U = 'koi8-u',
	Windows1250 = 'windows-1250',
	Windows1251 = 'windows-1251',
	Windows1252 = 'windows-1252',
	Windows1253 = 'windows-1253',
	Windows1254 = 'windows-1254',
	Windows1255 = 'windows-1255',
	Windows1256 = 'windows-1256',
	Windows1257 = 'windows-1257',
	Windows1258 = 'windows-1258',
	Macintosh = 'macintosh',
	GBK = 'gbk',
	GB18030 = 'gb18030',
	Big5 = 'big5',
	ShiftJIS = 'shift_jis',
	EUC_JP = 'euc-jp',
	EUC_KR = 'euc-kr',
	ISO2022_JP = 'iso-2022-jp'
}

// Array für Select/Dropdown
export const availableEncodings = Object.values(TextEncoding);

export function createTextDecoder(
	encoding: TextEncoding = settings.textEncoding as TextEncoding
): TextDecoder {
	return new TextDecoder(encoding);
}
