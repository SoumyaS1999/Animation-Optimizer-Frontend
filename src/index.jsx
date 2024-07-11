import { render } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import upimg from "./assets/uploadimg.png";
import fileimg from "./assets/fileimg.png";
import processimg from "./assets/process.png";
import downloadimg from "./assets/downloadimage.jfif";
import axios from "axios";
import "./styles.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [process, setProcess] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadfilename, setUploadfilename] = useState("");
  const [downloadLink, setDownloadLink] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(2);
  const [assets, setAssets] = useState(0);
  const [originalsize, setOriginalsize] = useState(0);
  const [processedsize, setProcessedsize] = useState(0);
  const [complete, setComplete] = useState(false);

  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
    console.log(file);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3000/file/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            console.log(progressEvent.loaded, progressEvent.total);
          },
        }
      );

      const jsonResponse = response.data.fileName;
      const actualsize = Math.floor(response.data.filesize / 1024);
      // @ts-ignore
      const jsonString = JSON.stringify(response.data);
      console.log(response.data);
      setFileName(jsonResponse);
      setUploadfilename(response.data.uploadFilename);
      setUploaded(true);
      setAssets(response.data.totalassets);
      setOriginalsize(actualsize);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownload = async () => {
    const time = Math.floor(2.18 * assets - 4.727);
    console.log(time);

    setProcess(true);
    setLoading(true);
    setIsAnimating(true);
    setAnimationDuration(time);
    try {
      const response = await axios.get(
        `http://localhost:3000/file/download/${uploadfilename}`
      );
      const jsonResponse = response.data;
      const jsonString = JSON.stringify(response.data);
      const sizeInBytes = new Blob([jsonString]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);

      console.log(`Size of JSON response data: ${sizeInKB} KB`);
      console.log('jsonresponse',jsonResponse);

      const blob = new Blob([JSON.stringify(jsonResponse)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      setDownloadLink({ url, filename:"newfile.json" });

      console.log('executing handledownload');

      setLoading(false);
      setProcessedsize(parseInt(sizeInKB));
      setComplete(true);
      //setProcessProgress(100);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    //console.log(fileName);
    const response = await axios.delete(
      `http://localhost:3000/file/delete/${uploadfilename}`
    );
    console.log("File deleted:", response.data);

    setFileName("");
    setUploaded(false);
    setProcess(false);
    setSelectedFile(null);
    setComplete(false);
    setDownloadLink(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete2 = () => {
    setFileName("");
    setUploaded(false);
    setProcess(false);
    setSelectedFile(null);
    setComplete(false);
    setDownloadLink(null);
  };

  // @ts-ignore
  const handleDrop = (event) => {
    if (uploaded == false) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
      console.log("rty", file);
      //console.log(selectedFile);
      handleUpload(file);
    } else {
      alert("Cannot process multiple files");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // @ts-ignore
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    console.log(file);
    handleUpload(file);
  };

  const handleUploadBtnClick = (e) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlefetch = () => {
    if (downloadLink) {
      const link = document.createElement("a");
      link.href = downloadLink.url;
      link.download = fileName;
      link.click();
    }
    setFileName("");
    setUploaded(false);
    setProcess(false);
    setSelectedFile(null);
    setComplete(false);
    setDownloadLink(null);
  };

  useEffect(() => {
    if (complete) {
      const progressElement = document.querySelector(".progress");
      if (progressElement) {
        progressElement.classList.add("progress-complete");
      }
    }
  }, [complete]);


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        height: "150vh",
      }}
    >
      <div id="heading">Animation Optimizer</div>
      <div className="heading2">Upload a File</div>
      <div className="dragbox" onDrop={handleDrop} onDragOver={handleDragOver}>
        <img
          src={upimg}
          alt="upload"
          style={{ height: "100px", width: "200px" }}
        ></img>
        {!uploaded && (
          <div>
            <p style={{ color: "indigo" }}>
              Drag And Drop Your File Here <br></br>Or
            </p>
          </div>
        )}
        {!uploaded && (
          <div id="input-form" className="upload-btn-wrapper">
            <button class="btn" onClick={handleUploadBtnClick}>
              Choose file
            </button>
            <input
              type="file"
              id="fileInput"
              name="file"
              required
              ref={fileInputRef}
              style={{ display: "none", marginTop: "10px", color: "white" }}
              onChange={handleFileChange}
            />
          </div>
        )}
        {selectedFile && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              border: "1px solid #ccc",
              borderRadius: "5px",
              margin: "10px 0px 10px 0px",
            }}
          >
            <img
              src={fileimg}
              style={{
                marginTop: "9px",
                marginLeft: "10px",
                height: "30px",
                width: "40px",
              }}
            ></img>
            <p
              style={{ color: "blue", marginRight: "10px", fontWeight: "bold" }}
            >
              {" "}
              {selectedFile.name}
            </p>
          </div>
        )}
      </div>
      <div
        style={{
          minHeight: "clamp(200px, 30vh, 400px)",
          minWidth: " clamp(300px, 50vw, 600px)",
        }}
      >
        {uploaded && (
          <div className="container2">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <svg
                id="uploadimg"
                height="50px"
                width="50px"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512.001 512.001"
              >
                <path
                  style="fill:#5692ed;"
                  d="M512.001,256.006c0,141.395-114.606,255.998-255.996,255.994
	C114.606,512.004,0.001,397.402,0.001,256.006C-0.007,114.61,114.606,0,256.005,0C397.395,0,512.001,114.614,512.001,256.006z"
                />
                <path
                  style="fill:#5e67ca;"
                  d="M498.97,336.633L255.64,93.301l-0.002-0.001l-1.667-1.667c-0.634-0.636-1.393-1.142-2.235-1.494
	c-0.837-0.35-1.743-0.539-2.669-0.539H96.534c-3.829,0-6.933,3.104-6.933,6.933v291.2c0,2.347,1.243,4.32,3.027,5.574
	c0.463,0.658,112.783,112.978,113.441,113.441c0.117,0.167,0.297,0.272,0.426,0.426c16.022,3.14,32.567,4.828,49.511,4.827
	C369.214,512.003,465.185,438.501,498.97,336.633z"
                />
                <g>
                  <path
                    style="fill:#F4F6F9;"
                    d="M103.467,103.467h138.667v62.4c0,3.829,3.104,6.933,6.933,6.933h62.4v41.6h13.867v-48.533
		c0-0.926-0.189-1.831-0.539-2.67c-0.352-0.842-0.859-1.6-1.494-2.235l-69.329-69.329c-0.635-0.635-1.393-1.142-2.235-1.494
		c-0.838-0.35-1.744-0.539-2.67-0.539H96.534c-3.829,0-6.933,3.104-6.933,6.933v291.2c0,3.829,3.104,6.933,6.933,6.933h117.867
		V380.8H103.467V103.467z M256.001,113.27l45.663,45.663h-45.663V113.27z"
                  />
                  <path
                    style="fill:#F4F6F9;"
                    d="M420.37,327.364l-27.731-27.731l-0.004-0.004l-55.465-55.465c-2.708-2.708-7.095-2.708-9.804,0
		l-55.465,55.465l-0.004,0.004l-27.731,27.731c-2.708,2.708-2.708,7.095,0,9.804c2.708,2.708,7.095,2.708,9.804,0l15.898-15.898
		v94.196c0,3.829,3.104,6.933,6.933,6.933h27.733h55.467h27.733c3.829,0,6.933-3.104,6.933-6.933V321.27l15.898,15.898
		c1.355,1.355,3.129,2.031,4.902,2.031s3.548-0.677,4.902-2.031C423.078,334.461,423.078,330.073,420.37,327.364z M311.467,408.533
		v-41.6h41.6v41.6H311.467z M380.801,408.533h-13.867V360c0-3.829-3.104-6.933-6.933-6.933h-55.467
		c-3.829,0-6.933,3.104-6.933,6.933v48.533h-13.867v-101.13l48.533-48.533l48.533,48.533V408.533z"
                  />
                </g>
              </svg>
              <div className="filename" name="filename">
                <span style={{ color: "blue", fontWeight: "bold" }}>
                  {fileName}
                </span>
                <div className="progress-bar" style={{ marginBottom: "10px" }}>
                  <div
                    className={`progress2 ${
                      isAnimating ? "play-animation" : ""
                    }`}
                    style={{
                      "--animation-duration": `0.3s`,
                      backgroundColor: "blue",
                    }}
                  ></div>
                </div>
                <span style={{ color: "blue", fontWeight: "bold" }}>
                  {originalsize} Kb
                </span>
              </div>
              <div className="buttons-div">
                <button
                  id="cancelbtn"
                  className="custom-button"
                  type="button"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: "4px",
                    maxHeight: "30px",
                    color: "red",
                  }}
                  onClick={handleDelete}
                >
                  <svg
                    fill="grey"
                    width="25px"
                    height="25px"
                    viewBox="0 0 24 24"
                    id="88d39493-c6ac-4210-b3d4-e3c35835476f"
                    data-name="Livello 1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>prime</title>

                    <g
                      id="32843b47-c45c-4436-b212-99015eb713a5"
                      data-name="delete"
                    >
                      <path d="M23,2H17V0H7V2H1A1,1,0,0,0,0,3V5A1,1,0,0,0,1,6H23a1,1,0,0,0,1-1V3A1,1,0,0,0,23,2Z" />

                      <path d="M18.28,24H5.82a2,2,0,0,1-2-1.75L2,8H22L20.27,22.25A2,2,0,0,1,18.28,24Z" />
                    </g>
                  </svg>
                </button>
              </div>
            </div>
            <button
              className="btn"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                maxHeight: "30px",
                border: "1px blue solid",
                backgroundColor: "white",
                color: "blue",
              }}
              onClick={handleDownload}
            >
              <img
                src={processimg}
                style={{ height: "25px", width: "25px", marginRight: "8px" }}
              ></img>
              <p>Optimize file</p>
            </button>
          </div>
        )}
      </div>
      <div
        style={{
          minHeight: "clamp(200px, 30vh, 400px)",
          minWidth: " clamp(300px, 50vw, 600px)",
        }}
      >
        {process && (
          <div id="output">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <svg
                id="uploadimg"
                height="50px"
                width="50px"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512.001 512.001"
              >
                <path
                  style="fill:#7ce861;"
                  d="M512.001,256.006c0,141.395-114.606,255.998-255.996,255.994
	C114.606,512.004,0.001,397.402,0.001,256.006C-0.007,114.61,114.606,0,256.005,0C397.395,0,512.001,114.614,512.001,256.006z"
                />
                <path
                  style="fill:#29ae27;"
                  d="M498.97,336.633L255.64,93.301l-0.002-0.001l-1.667-1.667c-0.634-0.636-1.393-1.142-2.235-1.494
	c-0.837-0.35-1.743-0.539-2.669-0.539H96.534c-3.829,0-6.933,3.104-6.933,6.933v291.2c0,2.347,1.243,4.32,3.027,5.574
	c0.463,0.658,112.783,112.978,113.441,113.441c0.117,0.167,0.297,0.272,0.426,0.426c16.022,3.14,32.567,4.828,49.511,4.827
	C369.214,512.003,465.185,438.501,498.97,336.633z"
                />
                <g>
                  <path
                    style="fill:#F4F6F9;"
                    d="M103.467,103.467h138.667v62.4c0,3.829,3.104,6.933,6.933,6.933h62.4v41.6h13.867v-48.533
		c0-0.926-0.189-1.831-0.539-2.67c-0.352-0.842-0.859-1.6-1.494-2.235l-69.329-69.329c-0.635-0.635-1.393-1.142-2.235-1.494
		c-0.838-0.35-1.744-0.539-2.67-0.539H96.534c-3.829,0-6.933,3.104-6.933,6.933v291.2c0,3.829,3.104,6.933,6.933,6.933h117.867
		V380.8H103.467V103.467z M256.001,113.27l45.663,45.663h-45.663V113.27z"
                  />
                  <path
                    style="fill:#F4F6F9;"
                    d="M420.37,327.364l-27.731-27.731l-0.004-0.004l-55.465-55.465c-2.708-2.708-7.095-2.708-9.804,0
		l-55.465,55.465l-0.004,0.004l-27.731,27.731c-2.708,2.708-2.708,7.095,0,9.804c2.708,2.708,7.095,2.708,9.804,0l15.898-15.898
		v94.196c0,3.829,3.104,6.933,6.933,6.933h27.733h55.467h27.733c3.829,0,6.933-3.104,6.933-6.933V321.27l15.898,15.898
		c1.355,1.355,3.129,2.031,4.902,2.031s3.548-0.677,4.902-2.031C423.078,334.461,423.078,330.073,420.37,327.364z M311.467,408.533
		v-41.6h41.6v41.6H311.467z M380.801,408.533h-13.867V360c0-3.829-3.104-6.933-6.933-6.933h-55.467
		c-3.829,0-6.933,3.104-6.933,6.933v48.533h-13.867v-101.13l48.533-48.533l48.533,48.533V408.533z"
                  />
                </g>
              </svg>
              <div className="filename">
                <span style={{ color: "green", fontWeight: "bold" }}>
                  {fileName}
                </span>
                <div className="progress-bar" style={{ marginBottom: "10px" }}>
                  <div
                    className={`progress ${
                      isAnimating ? "play-animation" : ""
                    }`}
                    style={{ "--animation-duration": `${animationDuration}s` }}
                  ></div>
                </div>
                {loading && !downloadLink && (
                  <div
                    id="loading"
                    style={{ color: "green", fontWeight: "bold" }}
                  >
                    Processing ....
                  </div>
                )}
                {downloadLink && (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    {processedsize} Kb
                  </span>
                )}
              </div>
              <div className="buttons-div">
                {downloadLink && (
                  <div>
                    <button
                      id="cancelbtn"
                      className="custom-button"
                      type="button"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginLeft: "4px",
                        maxHeight: "30px",
                        color: "red",
                      }}
                      onClick={handleDelete2}
                    >
                      <svg
                        fill="grey"
                        width="25px"
                        height="25px"
                        viewBox="0 0 24 24"
                        id="88d39493-c6ac-4210-b3d4-e3c35835476f"
                        data-name="Livello 1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>prime</title>

                        <g
                          id="32843b47-c45c-4436-b212-99015eb713a5"
                          data-name="delete"
                        >
                          <path d="M23,2H17V0H7V2H1A1,1,0,0,0,0,3V5A1,1,0,0,0,1,6H23a1,1,0,0,0,1-1V3A1,1,0,0,0,23,2Z" />

                          <path d="M18.28,24H5.82a2,2,0,0,1-2-1.75L2,8H22L20.27,22.25A2,2,0,0,1,18.28,24Z" />
                        </g>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {downloadLink && (
                <button
                  className="btn"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    maxHeight: "30px",
                    border: "1px green solid",
                    backgroundColor: "white",
                    color: "green",
                  }}
                  onClick={handlefetch}
                >
                  <img
                    src={downloadimg}
                    style={{
                      height: "25px",
                      width: "25px",
                      marginRight: "8px",
                    }}
                  ></img>
                  <p>Download file</p>
                </button>  
            )}
          </div>
        )}
      </div>
    </div>
  );
}
render(<App />, document.getElementById("app"));
