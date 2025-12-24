import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    FaRobot,
    FaTable,
    FaGamepad,
    FaNewspaper,
    FaArrowRight,
    FaDatabase,
    FaMagic
} from 'react-icons/fa'

const HomePage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            },
        },
    }

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 80,
                damping: 15
            }
        },
    }

    const features = [
        {
            title: 'NL2SQL Engine',
            description: 'Turn natural language into complex SQL queries instantly using advanced LLMs.',
            icon: <FaDatabase className='w-8 h-8' />,
            link: '/nl2sql',
            color: 'from-blue-400 to-indigo-600',
            shadow: 'shadow-blue-500/20'
        },
        {
            title: 'Smart Data Frame',
            description: 'Intelligent data transformation and visualization tools for your datasets.',
            icon: <FaTable className='w-8 h-8' />,
            link: '/dataframe-converter',
            color: 'from-emerald-400 to-teal-600',
            shadow: 'shadow-emerald-500/20'
        },
        {
            title: 'AI Pulse News',
            description: 'Curated real-time updates from the world of Artificial Intelligence.',
            icon: <FaNewspaper className='w-8 h-8' />,
            link: '/ai-news',
            color: 'from-violet-400 to-purple-600',
            shadow: 'shadow-violet-500/20'
        },
        {
            title: 'Game Arena',
            description: 'Test your skills against our strategic AI in TicTacToe and Gomoku.',
            icon: <FaGamepad className='w-8 h-8' />,
            link: '/tictactoe',
            color: 'from-rose-400 to-pink-600',
            shadow: 'shadow-rose-500/20'
        },
    ]

    return (
        <div className='min-h-full p-6 md:px-12 md:py-16 max-w-7xl mx-auto'>
            <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='relative z-10'
            >
                {/* Hero Section */}
                <div className='text-center py-16 md:py-24 relative'>

                    {/* Decorative blurred blobs */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 rounded-full blur-[100px] pointer-events-none"
                    />

                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, type: 'spring' }}
                        className='mb-8 inline-flex p-8 rounded-[2rem] bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl shadow-glass-lg border border-white/30 relative overflow-hidden group'
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <FaRobot className='w-20 h-20 text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]' />
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className='text-6xl md:text-8xl font-display font-extrabold mb-8 text-white drop-shadow-sm tracking-tight leading-none'
                    >
                        Supercharge <br className='hidden md:block' />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
                            Your Agent
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className='text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light'
                    >
                        Experience the next generation of AI interaction.
                        Analyze data, generate queries, and explore intelligence in a breathtaking interface.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to='/nl2sql'
                            className='group relative px-10 py-5 bg-white text-slate-900 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.7)] flex items-center overflow-hidden'
                        >
                            <span className="relative z-10 flex items-center">
                                Start Exploring
                                <FaMagic className='ml-2 group-hover:rotate-12 transition-transform' />
                            </span>
                        </Link>

                        <Link
                            to="/help"
                            className="px-10 py-5 rounded-full font-semibold text-lg text-white border border-white/30 hover:bg-white/10 transition-colors backdrop-blur-sm"
                        >
                            Learn More
                        </Link>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12'
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -10, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className='h-full'
                        >
                            <Link
                                to={feature.link}
                                className={`block h-full p-8 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-300 group overflow-hidden relative ${feature.shadow}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-br ${feature.color} w-fit shadow-lg group-hover:scale-110 transition-transform duration-300 text-white`}>
                                    {feature.icon}
                                </div>
                                <h3 className='text-2xl font-bold mb-3 text-white group-hover:text-blue-200 transition-colors'>
                                    {feature.title}
                                </h3>
                                <p className='text-white/70 text-base leading-relaxed group-hover:text-white/90 transition-colors'>
                                    {feature.description}
                                </p>

                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                    <FaArrowRight className="text-white w-5 h-5" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Footer Info */}
                <motion.div
                    variants={itemVariants}
                    className='mt-32 pb-10 text-center text-white/40 text-sm font-medium'
                >
                    <p>© 2025 AI Agent. Crafted for the future of work.</p>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default HomePage
