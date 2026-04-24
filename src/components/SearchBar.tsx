import { Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const { t } = useLanguage();

  return (
    <div className="relative">
      <div className="glass rounded-2xl flex items-center px-4 py-3 gap-3 shadow-glow">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder={t("common.searchBooks")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
      </div>
    </div>
  );
};

export default SearchBar;
