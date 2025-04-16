# Media-Gallery-Azure-Blob-and-CosmosDB-Storage
Azure Blob Storage is a Microsoft Azure cloud-based object storage solution. It enables developers to use blobs to store and manage unstructured data such as documents, photos, videos, backups, and logs. 

# 📦 Cloud-Native Media Uploader

**Author:** Sagar Sapkota
**Course:** COM682 – Cloud Native Development  
**University:** QAHE / Ulster University  
**Instructor:** Dr Zeeshan Tariq  
**Submission:** Coursework 2 – Part 2  

---

## 🚀 Project Overview

This project is a **cloud-native web application** that allows users to upload and preview **images, videos, and audio files** in real-time. The app is built using:

- **React (Vite)** for the frontend UI  
- **Azure Blob Storage** for storing uploaded media  
- **Azure Monitor & Application Insights** for observability  
- **GitHub** for version control and future CI/CD

The solution is deployed entirely in the cloud, with a **custom logic architecture** (no backend server or Logic App used).

---

## 🧠 Features

✅ Upload and preview **images, videos, and audios**  
✅ File-type based rendering: `img`, `video`, `audio`  
✅ Direct integration with **Azure Blob Storage** via SDK  
✅ Filtering by media type (Images / Videos / Audio)  
✅ Live monitoring using **Azure App Insights**  
✅ GitHub-based continuous development and CI/CD ready  

---

## 🗂️ Project Structure

## 🗂️ Project Structure

```bash
📁 src/
 ┣ 📂 components/
 ┃ ┗ 📄 Loading.jsx        # Loader animation
 ┣ 📂 assets/
 ┃ ┗ 📄 placeholder.jpeg   # Default preview image
 ┣ 📄 App.jsx              # Main component with upload and preview logic
 ┣ 📄 main.jsx             # React entry point
📄 index.css               # Global styles
📄 .env                    # Azure Blob credentials (local only)
📄 vite.config.js
⚙️ Technologies Used
```


## Technology	Purpose
React + Vite	Frontend Framework
Azure Blob Storage	Media file hosting
Azure SDK (@azure/storage-blob)	File upload + blob management
Application Insights	Monitoring & Performance Logs
GitHub	Version control + CI/CD ready
🔐 Azure Setup
Storage Account: cloudnativemedia

Container: cloudnativeimage

## Access secured via SAS Token used in .env file:

VITE_STORAGE_ACCOUNT=cloudnativemedia
VITE_STORAGE_CONTAINER=cloudnativeimage
VITE_STORAGE_SAS=<your-sas-token>


## 🌐 Logic Flow Architecture

[User Uploads File]
     ↓
[React App Reads File]
     ↓
[Upload to Azure Blob Storage via SDK]
     ↓
[Blob Stored in cloudnativeimage Container]
     ↓
[Fetch All Files with listBlobsFlat()]
     ↓
[Render Preview on Frontend]
📊 Monitoring

Azure Application Insights is configured for tracking:

Request logs

Upload performance

API interactions and health metrics


## 🧪 How to Run Locally
Clone this repo:

bash

git clone https://github.com/jaideepsingh/cloud-native-media-uploader.git
cd cloud-native-media-uploader
Install dependencies:

bash

npm install
Create a .env file:

env

VITE_STORAGE_ACCOUNT=cloudnativemedia
VITE_STORAGE_CONTAINER=cloudnativeimage
VITE_STORAGE_SAS=<your-sas-token>
Run the app:


npm run dev
🛡️ Security Notes
No media files are publicly accessible unless you set container access to "Blob".

SAS tokens must be rotated regularly.

Do not commit your .env file to GitHub.

📦 CI/CD (Planned)
This project will later integrate:

GitHub Actions for testing + deployment

Blob-triggered notifications via Event Grid (optional)
