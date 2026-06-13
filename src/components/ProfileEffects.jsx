import { motion } from 'framer-motion'

function Particles() {
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-signal rounded-full"
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            opacity: 0
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            repeat: Infinity
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}
    </div>
  )
}

function Aurora() {
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-30 blur-lg"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity },
          scale: { duration: 3, repeat: Infinity }
        }}
      />
    </div>
  )
}

function Fire() {
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 40 - i * 2,
            height: 40 - i * 2,
            background: `radial-gradient(circle, rgba(255,100,0,${0.8 - i * 0.05}) 0%, transparent 70%)`,
            left: '50%',
            top: '50%',
            marginLeft: -20 + i,
            marginTop: -20 + i
          }}
          animate={{
            y: [-30, -80],
            opacity: [1, 0]
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  )
}

function Magic() {
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-400"
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1
          }}
          animate={{
            x: Math.cos((i / 30) * Math.PI * 2) * 100,
            y: Math.sin((i / 30) * Math.PI * 2) * 100,
            opacity: 0,
            scale: 0
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
          style={{
            left: '50%',
            top: '50%',
            marginLeft: -2,
            marginTop: -2
          }}
        />
      ))}
    </div>
  )
}

function Waves() {
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border-2 border-blue-400 rounded-full"
          style={{
            width: 60,
            height: 60,
            left: '50%',
            top: '50%',
            marginLeft: -30,
            marginTop: -30
          }}
          animate={{
            scale: [0.8, 1.5],
            opacity: [1, 0]
          }}
          transition={{
            duration: 2,
            delay: i * 0.4,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  )
}

function Void() {
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-black"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white opacity-20"
          style={{
            width: Math.random() * 20 + 5,
            height: Math.random() * 20 + 5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -100],
            opacity: [0.5, 0]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

export function ProfileEffect({ effectId }) {
  switch (effectId) {
    case 'particles':
      return <Particles />
    case 'aurora':
      return <Aurora />
    case 'fire':
      return <Fire />
    case 'magic':
      return <Magic />
    case 'waves':
      return <Waves />
    case 'void':
      return <Void />
    default:
      return null
  }
}
