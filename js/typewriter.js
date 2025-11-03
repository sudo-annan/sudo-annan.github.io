class TypeWriter {
    constructor(element, phrases, typingSpeed = 100, erasingSpeed = 50, newPhraseDelay = 2000) {
        this.element = element;
        this.phrases = phrases;
        this.typingSpeed = typingSpeed;
        this.erasingSpeed = erasingSpeed;
        this.newPhraseDelay = newPhraseDelay;
        
        this.text = '';
        this.phraseIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        
        this.type();
    }
    
    type() {
        const currentPhrase = this.phrases[this.phraseIndex];
        
        if (this.isDeleting) {
            this.text = currentPhrase.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.text = currentPhrase.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        this.element.textContent = this.text;
        
        let typeSpeed = this.isDeleting ? this.erasingSpeed : this.typingSpeed;
        
        if (!this.isDeleting && this.charIndex === currentPhrase.length) {
            typeSpeed = this.newPhraseDelay;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// Initialize typewriter when hero section is loaded
function initializeTypewriter() {
    const phrases = [
        "CyberSec Graduate", 
        "Senior Software Engineer",
        "Application Security Engineer",
        "Cloud Security Engineer",
        "AI + Security",
        "Research Minded",
        "Problem Solver",
        "Tech Enthusiast"
    ];
    
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        new TypeWriter(typewriterElement, phrases);
    }
}

// Re-export for global access
window.TypeWriter = TypeWriter;
window.initializeTypewriter = initializeTypewriter;