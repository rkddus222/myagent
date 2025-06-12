// 수정된 코드
import { recentActivities } from '../../constants/dashboard.constant'

// 타입 정의 추가
interface Activity {
  user: string;
  target: string;
  action: string;
  time: string;
}

export default function RecentActivity() {
  return (
    <div className='bg-background-primary rounded-lg shadow-sm border border-border p-6'>
      <h2 className='text-lg font-bold mb-4'>최근 활동</h2>
      <div className='space-y-4'>
        {recentActivities.map((activity: Activity, index: number) => (
          <div
            key={index}
            className='flex justify-between items-center py-3 border-b border-border last:border-0'
          >
            <div className='flex items-center gap-2'>
              <span className='text-secondary'>
                {activity.user}님이 {activity.target} {activity.action}
              </span>
            </div>
            <span className='text-sm text-gray-500'>{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}