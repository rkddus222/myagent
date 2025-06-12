const tempModalStyle = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 1000
  },
  content: {
    backgroundColor: 'var(--background-secondary)',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0',
    width: '99%',
    maxWidth: '50rem',
    height: '80%',
    maxHeight: '60rem',
    overflow: 'auto'
  }
}

const createModalStyle = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  content: {
    backgroundColor: 'var(--background-primary)',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    borderRadius: '10px',
    padding: '16px',
    width: '99%',
    maxWidth: '60rem',
    height: '80%',
    maxHeight: '60rem'
  }
}

const checkModalStyle = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  content: {
    width: '40rem',
    height: '20rem',
    padding: '0',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '1rem',
    backgroundColor: 'var(--background-secondary)',
    border: '1px solid var(--aicfo-purple-accent)'
  }
}

export { tempModalStyle, createModalStyle, checkModalStyle }
