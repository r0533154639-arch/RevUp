export default function MediaViewer({ type, src, alt }) {
  if (type === 'image') return <img src={src} alt={alt} style={{ maxWidth: '100%' }} />;
  if (type === 'video') return <video src={src} controls style={{ maxWidth: '100%' }} />;
  if (type === 'audio') return <audio src={src} controls />;
  return <p>{src}</p>;
}
