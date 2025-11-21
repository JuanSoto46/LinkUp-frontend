import { Link } from "react-router-dom";

/** Home with visual sitemap and hints (heuristic: visibility of system status). */
export default function Home() {
  return (
    <div className="grid gap-6">
      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Welcome</h2>
          <p>Navigate using the sitemap below.</p>
        </div>
        <div className="p-6 border rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Visual sitemap</h2>
          <div className="flex flex-wrap gap-3">
            {[
              ["Home","/"],
              ["About","/about"],
              ["Explore","/explore"],
              ["Create meeting","/create-meeting"],
              ["Profile","/profile"],
              ["Login","/auth/login"],
              ["Register","/auth/register"],
              ["Reset password","/auth/reset"]
            ].map(([label,href])=>(
              <Link key={href} to={href} className="px-3 py-2 rounded border">{label}</Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
