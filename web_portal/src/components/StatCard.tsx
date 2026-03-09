interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string; // Should be a hex code
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <div
            className="relative overflow-hidden group cursor-pointer bg-white rounded-[2rem] shadow-premium hover:shadow-2xl transition-all duration-500 p-8 border border-slate-100 hover:-translate-y-2"
            style={{ "--accent-color": color } as React.CSSProperties}
        >
            {/* Accent Blur */}
            <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-700 bg-[var(--accent-color)]"
            />

            <div className="flex justify-between items-start relative z-10 mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors shadow-inner">
                    <span className="text-2xl transform group-hover:scale-125 transition-transform duration-500 block text-[var(--accent-color)]">{icon}</span>
                </div>
                <div className="w-2 h-2 rounded-full animate-pulse bg-[var(--accent-color)]" />
            </div>

            <div className="relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</h3>
                <span className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-primary transition-colors duration-500">{value}</span>
            </div>

            {/* Bottom Progress Line Accent */}
            <div className="absolute bottom-0 left-0 w-0 h-1 group-hover:w-full transition-all duration-700 bg-[var(--accent-color)]" />
        </div>
    );
}
