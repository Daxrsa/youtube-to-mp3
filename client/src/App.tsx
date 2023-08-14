import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function convertVideo(url: string) {
    setIsLoading(true);
    axios
      .get("http://localhost:5071/api/Video/convert", {
        params: { url: url },
        responseType: "blob",
      })
      .then((response) => {
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        console.log(response.data)
        setDownloadUrl(blobUrl);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error converting the video:", error);
        setIsLoading(false);
      });
  }

  function downloadFile() {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "video.mp3");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    }
  }

  return (
    <>
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "300px",
          background:
            "linear-gradient(90deg, rgba(19,90,195,1) 0%, rgba(201,0,255,0.8599089293920693) 100%)",
          color: "transparent",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          fontFamily: "cursive",
        }}
      >
        YouTube to MP3 Converter
      </h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TextField
          label="Enter url..."
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ marginRight: "20px" }}
        />
        {isLoading ? (
          <CircularProgress />
        ) : downloadUrl ? (
          <Button
            variant="contained"
            onClick={downloadFile}
            style={{
              marginLeft: "20px",
              background: "#c900ff",
            }}
          >
            Download
          </Button>
        ) : (
          <Button
            variant="contained"
            style={{
              background: "#135ac3",
            }}
            onClick={() => convertVideo(url)}
          >
            Convert
          </Button>
        )}
      </div>
    </>
  );
}

export default App;
