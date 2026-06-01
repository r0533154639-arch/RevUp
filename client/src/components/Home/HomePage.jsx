export default function HomePage({ user }) {
  return (
    <div className="page-container">
      <h3>Hi, {user.name}</h3>
      <p>Home Page</p>
    </div>
  );
}
