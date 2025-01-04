interface Category {
  name: string;
  count: number;
}

interface DashboardStats {
  totalItems: number;
  importantToday: number;
  categories: Category[];
}

interface DashboardProps {
  stats: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Items</h2>
          <p className="text-3xl font-bold">{stats.totalItems}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Important Today</h2>
          <p className="text-3xl font-bold">{stats.importantToday}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.categories.map((category) => (
            <div
              key={category.name}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
            >
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-2xl font-bold mt-2">{category.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 