import React, { useState, useRef } from 'react';

const ImageUpload = ({ imageUrl, onImageChange }) => {
  const [uploadOption, setUploadOption] = useState('upload');
  const [preview, setPreview] = useState(imageUrl || '');
  const fileInputRef = useRef(null);

  const handleOptionChange = (e) => {
    setUploadOption(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange(file); // send file to parent component
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onImageChange(url); // send URL string to parent
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Image Upload
      </label>

      <div className="flex items-center gap-4 mb-2">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            value="upload"
            checked={uploadOption === 'upload'}
            onChange={handleOptionChange}
          />
          Upload from Device
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            value="url"
            checked={uploadOption === 'url'}
            onChange={handleOptionChange}
          />
          Paste Image Link
        </label>
      </div>

      {uploadOption === 'upload' ? (
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="block mb-2"
        />
      ) : (
        <input
          type="text"
          placeholder="Paste image URL"
          value={preview}
          onChange={handleUrlChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
        />
      )}

      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="w-40 h-28 object-cover rounded border"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
