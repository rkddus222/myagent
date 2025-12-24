import { useNavigate } from 'react-router-dom'
import { leftSideElementProps } from '@/constants/sidebar.constant'
import CustomIcon, { CustomIconsName } from '@/components/common/Icons'

interface SubMenuPageProps {
    title: string
    items: leftSideElementProps[]
}

const SubMenuPage = ({ title, items }: SubMenuPageProps) => {
    const navigate = useNavigate()

    return (
        <div className='p-8 h-full flex flex-col animate-fadeIn'>
            <h1 className='text-4xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 tracking-tight'>
                {title}
            </h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {items.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => item.to && navigate(item.to)}
                        className='group relative flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-2xl hover:border-blue-500/30'
                    >
                        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                        <div className='relative z-10 p-4 rounded-full bg-white/5 mb-6 group-hover:bg-blue-500/20 transition-colors duration-300 text-blue-400'>
                            <CustomIcon
                                name={item.name as CustomIconsName}
                                className="w-8 h-8"
                            />
                        </div>

                        <span className='relative z-10 text-xl font-bold text-gray-200 group-hover:text-white transition-colors duration-300'>
                            {item.title}
                        </span>

                        <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left' />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default SubMenuPage
