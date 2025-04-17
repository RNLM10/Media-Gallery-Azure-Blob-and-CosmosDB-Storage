import { useEffect, useState } from 'react';
import './App.css';
import { AiFillDelete } from 'react-icons/ai';
import {
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaGithub
} from 'react-icons/fa';
import { BlobServiceClient } from '@azure/storage-blob';
import { CosmosClient } from '@azure/cosmos';

const App = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [previewURL, setPreviewURL] = useState(null);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [expandedMedia, setExpandedMedia] = useState(null);
  const [clock, setClock] = useState('');
  const [weather, setWeather] = useState({ temp: 12, desc: 'Cloudy' });

  const account = import.meta.env.VITE_STORAGE_ACCOUNT;
  const sasToken = import.meta.env.VITE_STORAGE_SAS;
  const containerName = import.meta.env.VITE_STORAGE_CONTAINER;
  const cosmosEndpoint = import.meta.env.VITE_COSMOS_ENDPOINT;
  const cosmosKey = import.meta.env.VITE_COSMOS_KEY;

  const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net/?${sasToken}`);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const cosmosClient = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });
  const db = cosmosClient.database("mediaMetaDB");
  const metadataContainer = db.container("files");

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchMedia();
    startClock();
  }, []);

  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  const startClock = () => {
    setInterval(() => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-UK', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setClock(formatted);
    }, 1000);
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'm4a'].includes(ext)) return 'audio';
    return 'other';
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const query = "SELECT * FROM c ORDER BY c._ts DESC";
      const { resources } = await metadataContainer.items.query(query).fetchAll();
      setMediaUrls(resources);
    } catch (err) {
      console.error("Failed to fetch metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileType(type);
      setFile(selectedFile);
      setPreviewURL(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a file to upload.");
    try {
      setLoading(true);
      const blobName = `${Date.now()}-${file.name}`;
      const blobClient = containerClient.getBlockBlobClient(blobName);
      await blobClient.uploadData(file, { blobHTTPHeaders: { blobContentType: file.type } });

      const metadata = {
        id: blobName,
        name: blobName,
        url: blobClient.url,
        fileType: fileType,
        timestamp: new Date().toISOString()
      };

      await metadataContainer.items.create(metadata);
      setFile(null);
      setPreviewURL(null);
      await fetchMedia();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blobName) => {
    try {
      setLoading(true);
      const blobClient = containerClient.getBlockBlobClient(blobName);
      await blobClient.delete();
      const item = mediaUrls.find((item) => item.name === blobName);
      if (item) await metadataContainer.item(blobName, item.fileType).delete();
      await fetchMedia();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const filteredMedia = mediaUrls.filter(media =>
    (filter === 'all' || media.fileType === filter) &&
    media.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container fade-in">
      {loading && <div className="loading-overlay">Loading...</div>}

      <header>
        <h1>🎥 <span>Media Gallery</span> <span style={{ fontWeight: 'bold' }}>(Blob Storage + Cosmos DB)</span></h1>
        <div className="auth-buttons">
          <button onClick={() => setShowLogin(true)}>🔐 Login</button>
          <button onClick={() => setShowSignup(true)}>📝 Sign Up</button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>

      <div className="widget-container" style={{ justifyContent: 'space-between', width: '100%' }}>
        <div className="digital-clock">⏰ {clock}</div>
        <div className="weather-box">🌤️ London: {weather.temp}°C | {weather.desc}</div>
      </div>

      <div className="upload-container">
        <section className="upload-sections">
          {['image', 'video', 'audio'].map(type => (
            <div className="upload-card" key={type}>
              <h3>
                {type === 'image' && <FaFileImage />} 
                {type === 'video' && <FaFileVideo />} 
                {type === 'audio' && <FaFileAudio />} 
                Upload {type.charAt(0).toUpperCase() + type.slice(1)}
              </h3>
              <input type="file" accept={`${type}/*`} onChange={(e) => handleFileChange(e, type)} />
            </div>
          ))}
        </section>

        <button className="upload-btn pulse" onClick={handleUpload}>🚀 Upload</button>

        <div className="filter-section" style={{ display: 'flex', alignSelf: 'stretch', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <label>Filter by Media Type:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audios</option>
            </select>
          </div>
          <div>
            <input type="text" placeholder="🔍 Search by name or ID" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        </div>
      </div>

      {file && (
        <div className="preview-card">
          <h4>Preview:</h4>
          {fileType === 'image' && <img className="preview-media" src={previewURL} alt="preview" />}
          {fileType === 'video' && <video className="preview-media" src={previewURL} controls autoPlay muted />}
          {fileType === 'audio' && <audio src={previewURL} controls />}
        </div>
      )}

      <div className="media-grid">
        {filteredMedia.map((media, index) => (
          <div key={index} className="media-card">
            <div className="media-clickable">
              {media.fileType === 'image' && (
                <img src={media.url} alt={media.name} onClick={() => setExpandedMedia(media)} />
              )}
              {media.fileType === 'video' && (
                <video src={media.url} controls />
              )}
              {media.fileType === 'audio' && (
                <audio src={media.url} controls />
              )}
            </div>
            <div className="media-info">
              <p title={media.name}>{media.name}</p>
              <button className="del-btn" onClick={() => handleDelete(media.name)} title="Delete media"><AiFillDelete /></button>
            </div>
          </div>
        ))}
      </div>

      <footer>
        <h4>📞 Contact Us</h4>
        <p>Email: support@mediagallery.com</p>
        <p>Phone: +1 (234) 567-8901</p>
        <p>Location: Cloud Street, Azure Lane, WebCity</p>
        <div className="footer-icons">
          <a href="#"><FaFacebook /></a>
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaGithub /></a>
        </div>
      </footer>

      {showLogin && (
        <div className="modal" onClick={() => setShowLogin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🔐 Login</h3>
            <input placeholder="Username" />
            <input placeholder="Password" type="password" />
            <div className="modal-actions">
              <button onClick={() => setShowLogin(false)}>Close</button>
              <button>Fake Login</button>
            </div>
          </div>
        </div>
      )}

      {showSignup && (
        <div className="modal" onClick={() => setShowSignup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📝 Sign Up</h3>
            <input placeholder="Full Name" />
            <input placeholder="Email" />
            <input placeholder="Password" type="password" />
            <div className="modal-actions">
              <button onClick={() => setShowSignup(false)}>Close</button>
              <button>Fake Register</button>
            </div>
          </div>
        </div>
      )}

      {expandedMedia && (
        <div className="modal-viewer" onClick={() => setExpandedMedia(null)}>
          <div className="modal-content-viewer" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setExpandedMedia(null)}>X</button>
            {expandedMedia.fileType === 'image' && <img src={expandedMedia.url} alt={expandedMedia.name} />}
            {expandedMedia.fileType === 'video' && <video src={expandedMedia.url} controls autoPlay />}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
