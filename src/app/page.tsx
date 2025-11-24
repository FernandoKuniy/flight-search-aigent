import SearchForm from "@/components/SearchForm";
import ResultsList from "@/components/ResultsList";

export default function Page() {
  return (
    <main className="px-6 py-10 max-w-4xl mx-auto">
      <SearchForm />
      <ResultsList />
    </main>
  );
}