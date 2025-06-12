import CustomButton from '@components/common/CustomButton'
import CustomInput from '@components/common/CustomInput'

import useModalStore from '@stores/useModalStore'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function LoginModal() {
  const navigate = useNavigate()
  const { closeModal } = useModalStore()
  const [loginStep, setLoginStep] = useState<'id' | 'password'>('id')
  const [userId, setUserId] = useState('')
  const [userPwd, setUserPwd] = useState('')

  // 다음 단계로 이동 (아이디 입력 → 비밀번호 입력)
  const handleContinue = () => {
    if (!userId.trim()) {
      // 실제로는 유효성 검사 추가 필요
      return
    }
    setLoginStep('password')
  }

  // 이전 단계로 돌아가기 (비밀번호 입력 → 아이디 입력)
  const handleBack = () => {
    setLoginStep('id')
  }

  const handleLogin = () => {
    if (!userPwd.trim()) {
      // 실제로는 유효성 검사 추가 필요
      return
    }
    
    // 여기서 실제 로그인 API 호출 로직 추가
    
    navigate('/main')
    closeModal()
  }

  return (
    <div className='flex flex-col gap-4 bg-transparent h-full mt-10'>
      {loginStep === 'id' ? (
        // 아이디 입력 단계
        <>
          <CustomInput 
            label='아이디' 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)} 
          />
          <CustomButton
            label='다음'
            onClick={handleContinue}
          />
        </>
      ) : (
        // 비밀번호 입력 단계
        <>
          <div className='mb-2 flex items-center'>
            <button
              onClick={handleBack}
              className='text-blue-600 hover:text-blue-800 mr-2'
            >
              ←
            </button>
            <div className='text-left'>
              <p className='text-sm text-gray-500'>로그인:</p>
              <p className='font-medium'>{userId}</p>
            </div>
          </div>
          
          <CustomInput 
            label='비밀번호' 
            value={userPwd} 
            onChange={(e) => setUserPwd(e.target.value)} 
            type='password'
          />
          <CustomButton
            label='로그인'
            onClick={handleLogin}
          />
        </>
      )}
    </div>
  )
}