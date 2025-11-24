'use client';


import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const handleBack = () => router.back();
    const handleSignIn = () => router.push('/login');

    return (
      <div
    className="relative min-h-[120vh] w-full flex justify-center items-start bg-cover bg-center"
    style={{
        backgroundImage: 'url("/bgimage.png")',
        backgroundSize: "cover",         //Fond large et long
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
    }}
>
    {/* Overlay sombre */}
    <div className="absolute inset-0 z-0 bg-black/80 pointer-events-none"></div>

    {/* Box principale */}
    <div
        className="relative z-10 mt-10 w-[90%] max-w-[430px] h-[722px] 
                   rounded-[32px] flex flex-col items-center gap-6 p-8"
        style={{
            backgroundImage: 'url("/images/bgimageregister.png")',
            backgroundSize: "cover",    
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}
    >


                {/* LOGO */}
                <img src="/logo.png" className="w-[188px] h-[44px] mt-2" />

                {/* TITRE */}
                <h1 className="text-white text-2xl font-semibold mt-2">
                    S’inscrire
                </h1>

                {/* FORMULAIRE */}
                <form className="flex flex-col gap-4 w-full px-4 mt-4">

                    {/* Email */}
                    <div className="flex flex-col">
                        <label className="text-white text-sm mb-1">
                            Email <span className="text-red-600 text-xl">*</span>
                        </label>
                        <input
                            type="email"
                            className="w-full h-[40px] rounded-md px-3 bg-transparent text-white border border-white/40 focus:border-red-600 outline-none text-sm"
                            required
                        />
                    </div>

                    {/* Mot de passe */}
                    <div className="flex flex-col">
                        <label className="text-white text-sm mb-1">
                            Mot de passe <span className="text-red-600 text-xl">*</span>
                        </label>
                        <input
                            type="password"
                            className="w-full h-[40px] rounded-md px-3 bg-transparent text-white border border-white/40 focus:border-red-600 outline-none text-sm"
                            required
                        />
                    </div>

                    {/* Pseudo */}
                    <div className="flex flex-col">
                        <label className="text-white text-sm mb-1">
                            Pseudo
                        </label>
                        <input
                            type="text"
                            className="w-full h-[40px] rounded-md px-3 bg-transparent text-white border border-white/40 focus:border-red-600 outline-none text-sm"
                        />
                    </div>

                    {/* Cases à cocher */}
                    <div className="flex flex-col text-white text-sm gap-2 mt-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" />
                            J’ai 18 ans ou plus
                        </label>

                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" />
                            J’accepte les CGU et la Politique de confidentialité
                        </label>
                    </div>

                    {/* BOUTON CRÉER MON COMPTE */}
                    <button
                        type="submit"
                        className="w-[180px]  mx-auto h-[40px] rounded-[32px] bg-red-700 text-white font-medium text-sm hover:bg-red-800 transition"
                    >
                        Créer mon compte
                    </button>

                    {/* Se connecter avec Google */}
                    <button
                        type="button"
                        className="w-[227px] mx-auto h-[40px]  rounded-[32px] bg-white text-black border border-white/40 text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition"
                    >
                        <img src="/images/icongoogle.png" className="w-4 h-4" />
                        Se connecter avec Google
                    </button>
                </form>

                {/* PHRASES EN BAS */}
                <div className=" flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                        <span style={{ color: 'rgba(114,107,107,1)' }}>
                            Disposez-vous d’un compte ?
                        </span>
                        <button
                            onClick={handleSignIn}
                            className="text-sm"
                            style={{ color: 'rgba(132,14,14,1)' }}
                        >
                            S’identifier
                        </button>
                    </div>

                  
                </div>

            </div>
        </div>
    );
}
