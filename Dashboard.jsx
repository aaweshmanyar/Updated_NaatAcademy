import React from "react";
import Layout from "../../../component/Layout";
import {
  FileText,
  Users,
  List,
  Book,
  Layout as LayoutIcon,
  Folder,
  Users2,
  Hash,
  Plus,
} from "lucide-react";

const statsData = [
  {
    title: "Articles",
    count: 0,
    icon: FileText,
    color: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
  },
  {
    title: "Writers",
    count: 0,
    icon: Users,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
  },
  {
    title: "Poetry",
    count: 0,
    icon: List,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
  },
  {
    title: "Books",
    count: 0,
    icon: Book,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
  },
  {
    title: "Sections",
    count: 0,
    icon: LayoutIcon,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
  },
  {
    title: "Categories",
    count: 0,
    icon: Folder,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
  },
  {
    title: "Groups",
    count: 0,
    icon: Users2,
    color: "bg-teal-500",
    hoverColor: "hover:bg-teal-600",
  },
  {
    title: "Topics",
    count: 0,
    icon: Hash,
    color: "bg-pink-500",
    hoverColor: "hover:bg-pink-600",
  }
];

const Dashboard = () => {
  const [stats, setStats] = React.useState({
    articles: 0,
    writers: 0,
    poetry: 0,
    books: 0,
    sections: 0,
    categories: 0,
    groups: 0,
    topics: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const { stats: fetchedStats } = await response.json();
        setStats(fetchedStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Update statsData counts with real data
  const updatedStatsData = statsData.map(stat => ({
    ...stat,
    count: stats[stat.title.toLowerCase()]
  }));

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {updatedStatsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white shadow-md rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div
                      className={`p-3 rounded-full ${stat.color.replace(
                        "-500",
                        "-100"
                      )}`}
                    >
                      <Icon className={`h-6 w-6 ${stat.color.replace("bg-", "text-")}`} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stat.count}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">{stat.title}</h3>
                  <button
                    className={`flex items-center justify-center w-full py-2 px-4 text-sm font-medium text-white rounded-md ${stat.color} ${stat.hoverColor} transition`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 