import Header from "@/containers/header";
import Main from "@/containers/main";
import Footer from "@/containers/footer";

export default function Home() {
  return (
    <div className="bg-background overflow-y-auto">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
