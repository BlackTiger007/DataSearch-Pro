import type { NewScan } from '$lib/db/schema/scans';
import type { QueueItem } from '$lib/types/indexing';
import { splitSmartForDb } from '$lib/utils/split';

export async function extract(
	file: QueueItem,
	id: number,
	fileVersionId: number
): Promise<NewScan[]> {
	const unsupportedDocMessages = [
		'Das .doc-Format wird nicht unterstützt. Bitte wandeln Sie die Datei in ein neueres Format wie DOCX, PDF oder RTF um.', // Deutsch
		'The .doc format is not supported. Please convert the file to a newer format such as DOCX, PDF, or RTF.', // Englisch
		'El formato .doc no es compatible. Convierta el archivo a un formato más reciente como DOCX, PDF o RTF.', // Spanisch
		"Le format .doc n'est pas pris en charge. Veuillez convertir le fichier dans un format plus récent tel que DOCX, PDF ou RTF.", // Französisch
		'O formato .doc não é suportado. Converta o arquivo para um formato mais recente, como DOCX, PDF ou RTF.', // Portugiesisch
		'Il formato .doc non è supportato. Converti il file in un formato più recente come DOCX, PDF o RTF.', // Italienisch
		'Формат .doc не поддерживается. Пожалуйста, преобразуйте файл в более новый формат, например DOCX, PDF или RTF.', // Russisch
		'格式 .doc 不受支持。请将文件转换为较新的格式，如 DOCX、PDF 或 RTF。', // Chinesisch (vereinfacht)
		'フォーマット .doc はサポートされていません。ファイルを DOCX、PDF、RTF などの新しいフォーマットに変換してください。', // Japanisch
		'.doc 형식은 지원되지 않습니다. 파일을 DOCX, PDF 또는 RTF와 같은 최신 형식으로 변환하세요.', // Koreanisch
		'تنسيق .doc غير مدعوم. يرجى تحويل الملف إلى تنسيق أحدث مثل DOCX أو PDF أو RTF.', // Arabisch
		'फॉर्मेट .doc समर्थित नहीं है। कृपया फ़ाइल को DOCX, PDF या RTF जैसे नए फ़ॉर्मेट में बदलें।', // Hindi
		'.doc biçimi desteklenmiyor. Lütfen dosyayı DOCX, PDF veya RTF gibi daha yeni bir biçime dönüştürün.', // Türkisch
		'O formato .doc não é suportado. Por favor, converta o ficheiro para um formato mais recente como DOCX, PDF ou RTF.', // Portugiesisch (EU)
		'O formato .doc não é suportado. Por favor, converta o arquivo para um formato mais recente, como DOCX, PDF ou RTF.' // Portugiesisch (BR)
	];

	let lineNumber = 0;
	const textChunks: NewScan[] = [];

	for (const line of unsupportedDocMessages) {
		lineNumber++;
		textChunks.push(...splitSmartForDb(line, lineNumber, id, fileVersionId));
	}

	return textChunks;
}
