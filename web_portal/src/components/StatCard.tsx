interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string; // Should be a hex code
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <div className="k-card flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 pl-6">
            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }}></div>

            <div className="flex justify-between items-start">
                <h3 className="text-gray-600 font-bold text-sm uppercase tracking-wide">{title}</h3>
                <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: color }}>{icon}</span>
            </div>

            <div className="mt-auto">
                <span className="text-3xl font-black text-[#333]">{value}</span>
            </div>
        </div>
    );
}
