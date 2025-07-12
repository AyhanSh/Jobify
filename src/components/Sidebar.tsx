import React from 'react';
import { Grid, User, CreditCard, Info, History } from 'lucide-react';
import logo from '../../public/logo.png';

const Sidebar: React.FC = () => {
    return (
        <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between py-8 px-6 fixed left-0 top-0 z-40">
            <div>
                {/* Logo */}
                <div className="flex items-center mb-10">
                    <img src={logo} alt="Jobify Logo" className="rounded-lg w-8 h-8 mr-3" />
                    <span className="text-2xl font-bold text-gray-900 font-raleway">Jobify</span>
                </div>
                {/* Menu */}
                <nav className="mb-8">
                    <p className="text-xs font-semibold text-gray-500 mb-2 ml-2">Menu</p>
                    <ul className="space-y-1">
                        <li>
                            <a href="#" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-100">
                                <Grid className="w-4 h-4 mr-2" />
                                dashboard
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                                <User className="w-4 h-4 mr-2" />
                                account
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                                <CreditCard className="w-4 h-4 mr-2" />
                                subscription
                            </a>
                        </li>
                    </ul>
                </nav>
                {/* More */}
                <nav>
                    <p className="text-xs font-semibold text-gray-500 mb-2 ml-2">More</p>
                    <ul className="space-y-1">
                        <li>
                            <a href="#" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                                <Info className="w-4 h-4 mr-2" />
                                about jobify
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                                <History className="w-4 h-4 mr-2" />
                                history
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar; 