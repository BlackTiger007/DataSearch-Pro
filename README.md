<h1 align="center">
  <img
    src="./static/favicon.svg"
    width="128"
    alt="DataSearch-Pro Logo"
    style="padding: 5px; border-radius: 8px"
  />
  <br />DataSearch Pro
</h1>

<div align="center">

[![GitHub Issues](https://img.shields.io/github/issues/BlackTiger007/DataSearch-Pro?style=flat-square)](https://github.com/BlackTiger007/DataSearch-Pro/issues)
[![GitHub All Releases](https://img.shields.io/github/downloads/BlackTiger007/DataSearch-Pro/total?style=flat-square)](https://github.com/BlackTiger007/DataSearch-Pro/releases)
[![GitHub Release (latest SemVer)](https://img.shields.io/github/v/release/BlackTiger007/DataSearch-Pro?style=flat-square)](https://github.com/BlackTiger007/DataSearch-Pro/releases)
[![GitHub License](https://img.shields.io/github/license/BlackTiger007/DataSearch-Pro?style=flat-square)](https://github.com/BlackTiger007/DataSearch-Pro/blob/main/LICENSE)

</div>

**The intelligent disk management solution – simple, fast, and fully local.**

DataSearch Pro is a lightweight, local **Document Management System (DMS)** designed for personal or hobby projects. It helps you organize files on your hard drive, automatically index them, and quickly find what you need – no cloud or complex server setup required.

## Why DataSearch Pro?

- **Fast Full-Text Search:** Instantly search across all supported file types.
- **Metadata & Tags:** Organize files with tags, priorities, or notes.
- **Automation:** Automatically detects and processes new or changed files.
- **Versioning:** Keep track of older versions and compare changes.
- **Error Handling:** Optional logging to monitor potential issues.

## Features

- **Tags and Prioritization:** Highlight important files and organize them.
- **Automatic Indexing:** Add once and monitor – new content is detected automatically.
- **Folder Monitoring:** Track entire folders for changes.
- **Light/Dark Themes:** Customize the interface to your preference.
- **Auto-Start Indexing and Folder Watching**
- **Database Cleanup:** Remove entries for files that no longer exist.
- **File Filtering:** Only selected file types are indexed.
- Parallel processing of multiple files for faster indexing
- Capture videos/screenshots on errors

## Planned Enhancements

- Automatic sorting by file size (small → large)
- Advanced search: by date, tag, filename, or path
- Hotkeys for quick actions (e.g., “Restart Index”, “Add Folder”)
- Drag & drop files and folders directly into the app
- Worker pools / threads for improved performance on large datasets
- Diff feature for versioning, comparing changes between files
- Enhanced metadata for more precise searches

## Supported File Formats

### Currently Supported

- **Text**: `txt`, `csv`, `tsv`, `log`, `md`, `ini`, `yaml`, `yml`, `json`
- **PDF**: `pdf`
- **Images**: `png`, `jpg`, `jpeg` (text extraction via OCR if enabled in settings)
- **Office**: `docx`, `xlsx`, `pptx`, `odt`, `ods`, `odp`, `docm`, `rtf`
- **Web / XML-based**: `html`, `htm`, `xhtml`, `svg`, `xml`

### Planned / Optional

- **Web Formats**: `epub`
- **Audio/Video Metadata**: `mp3`, `mp4`, `mkv` (metadata only, subtitles if available)

### Notes

Image files (`png`, `jpg`, `jpeg`) are always processed with OCR.  
If **text extraction from embedded images** is enabled in settings, images inside documents (e.g., PDF, Word, PowerPoint) will also be processed with OCR.

**DataSearch Pro** makes it easy to manage and find files efficiently – all locally and securely on your machine.
