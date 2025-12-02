import React, { useState, useRef, useEffect } from "react";

interface IDropdownMenuProps {
    handleResetChat: () => void;
    handleDeleteChat: () => void;
}

export default function DropdownMenu({
    handleResetChat,
    handleDeleteChat,
}: IDropdownMenuProps) {
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fermeture automatique si clic extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white text-xl p-2 rounded-full hover:bg-gray-700 transition"
            >
                ⋮
            </button>

            {/* MENU SLIDE */}
            <div
                className={`
                    absolute top-[52px] right-[-20px] z-50
                    w-[224px] h-[131px]
                    rounded-[16px] backdrop-blur-md p-2 shadow-2xl
                    ${isMenuOpen ? "animate-slideInRight" : "animate-slideOutRight"}
                `}
                style={{
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                    border: "1px solid rgba(255,255,255,0.15)",
                }}
            >

                <button
                    onClick={() => {
                        handleResetChat();
                        setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/10 text-white"
                >
                    <img src="/icons/reset.png" width={18} height={18} />
                    <span className="text-sm">Réinitialiser le chat</span>
                </button>

                {/* LIGNE */}
                <div className="w-[202px] mx-auto border-t border-white/30 my-2" />

                <button
                    onClick={() => {
                        handleDeleteChat();
                        setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/10 text-white"
                >
                    <img src="/icons/delete.png" width={18} height={18} />
                    <span className="text-sm">Supprimer le chat</span>
                </button>
            </div>
        </div>
    );
}
