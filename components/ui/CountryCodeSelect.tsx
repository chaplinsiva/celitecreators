"use client";

import { useState, useRef, useEffect } from "react";

// Popular countries with their codes and flags
const COUNTRIES = [
    { code: "+91", country: "IN", name: "India", flag: "🇮🇳" },
    { code: "+1", country: "US", name: "United States", flag: "🇺🇸" },
    { code: "+44", country: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "+971", country: "AE", name: "UAE", flag: "🇦🇪" },
    { code: "+65", country: "SG", name: "Singapore", flag: "🇸🇬" },
    { code: "+61", country: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "+49", country: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "FR", name: "France", flag: "🇫🇷" },
    { code: "+81", country: "JP", name: "Japan", flag: "🇯🇵" },
    { code: "+86", country: "CN", name: "China", flag: "🇨🇳" },
    { code: "+82", country: "KR", name: "South Korea", flag: "🇰🇷" },
    { code: "+39", country: "IT", name: "Italy", flag: "🇮🇹" },
    { code: "+34", country: "ES", name: "Spain", flag: "🇪🇸" },
    { code: "+31", country: "NL", name: "Netherlands", flag: "🇳🇱" },
    { code: "+46", country: "SE", name: "Sweden", flag: "🇸🇪" },
    { code: "+41", country: "CH", name: "Switzerland", flag: "🇨🇭" },
    { code: "+55", country: "BR", name: "Brazil", flag: "🇧🇷" },
    { code: "+52", country: "MX", name: "Mexico", flag: "🇲🇽" },
    { code: "+7", country: "RU", name: "Russia", flag: "🇷🇺" },
    { code: "+27", country: "ZA", name: "South Africa", flag: "🇿🇦" },
    { code: "+234", country: "NG", name: "Nigeria", flag: "🇳🇬" },
    { code: "+254", country: "KE", name: "Kenya", flag: "🇰🇪" },
    { code: "+20", country: "EG", name: "Egypt", flag: "🇪🇬" },
    { code: "+966", country: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+92", country: "PK", name: "Pakistan", flag: "🇵🇰" },
    { code: "+880", country: "BD", name: "Bangladesh", flag: "🇧🇩" },
    { code: "+94", country: "LK", name: "Sri Lanka", flag: "🇱🇰" },
    { code: "+977", country: "NP", name: "Nepal", flag: "🇳🇵" },
    { code: "+60", country: "MY", name: "Malaysia", flag: "🇲🇾" },
    { code: "+66", country: "TH", name: "Thailand", flag: "🇹🇭" },
    { code: "+84", country: "VN", name: "Vietnam", flag: "🇻🇳" },
    { code: "+62", country: "ID", name: "Indonesia", flag: "🇮🇩" },
    { code: "+63", country: "PH", name: "Philippines", flag: "🇵🇭" },
    { code: "+64", country: "NZ", name: "New Zealand", flag: "🇳🇿" },
    { code: "+353", country: "IE", name: "Ireland", flag: "🇮🇪" },
    { code: "+48", country: "PL", name: "Poland", flag: "🇵🇱" },
    { code: "+43", country: "AT", name: "Austria", flag: "🇦🇹" },
    { code: "+32", country: "BE", name: "Belgium", flag: "🇧🇪" },
    { code: "+45", country: "DK", name: "Denmark", flag: "🇩🇰" },
    { code: "+47", country: "NO", name: "Norway", flag: "🇳🇴" },
    { code: "+358", country: "FI", name: "Finland", flag: "🇫🇮" },
];

type CountryCodeSelectProps = {
    value: string;
    onChange: (code: string) => void;
};

export function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];

    const filtered = COUNTRIES.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.includes(search) ||
            c.country.toLowerCase().includes(search.toLowerCase())
    );

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-3 border border-slate-800 border-r-0 rounded-l-xl bg-[#0F172A] hover:bg-slate-800/80 transition-colors min-w-[95px] text-white"
            >
                <span className="text-xl">{selected.flag}</span>
                <span className="text-sm font-semibold text-slate-200">{selected.code}</span>
                <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl max-h-72 overflow-hidden text-white">
                    {/* Search input */}
                    <div className="p-2.5 border-b border-slate-800/80">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search country..."
                            className="w-full px-3 py-2 text-sm bg-[#090D16] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:border-sky-500 outline-none"
                        />
                    </div>

                    {/* Country list */}
                    <div className="overflow-y-auto max-h-52 divide-y divide-slate-800/40">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-slate-400 text-center">No countries found</div>
                        ) : (
                            filtered.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                        onChange(country.code);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-800 transition-colors ${country.code === value ? "bg-slate-800/80 text-sky-400 font-bold" : "text-slate-200"
                                        }`}
                                >
                                    <span className="text-xl">{country.flag}</span>
                                    <span className="text-sm flex-1 text-left truncate">{country.name}</span>
                                    <span className="text-xs text-slate-400 font-mono">{country.code}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export { COUNTRIES };
