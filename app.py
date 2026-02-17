from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import random
import json
from datetime import datetime

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')
CORS(app)

# Comprehensive knowledge base for different subjects
KNOWLEDGE_BASE = {
    'mathematics': {
        'name': 'Mathematics',
        'topics': {
            'algebra': {
                'key_concepts': ['Variables', 'Equations', 'Functions', 'Polynomials', 'Inequalities'],
                'formulas': ['Quadratic formula: x = [-b ± √(b² - 4ac)]/2a',
                           'Slope: m = (y₂ - y₁)/(x₂ - x₁)',
                           'Distance formula: d = √[(x₂ - x₁)² + (y₂ - y₁)²]'],
                'applications': ['Physics calculations', 'Engineering design', 'Financial modeling']
            },
            'calculus': {
                'key_concepts': ['Limits', 'Derivatives', 'Integrals', 'Series', 'Multivariable calculus'],
                'formulas': ['Power rule: d/dx(xⁿ) = nxⁿ⁻¹',
                           'Chain rule: dy/dx = (dy/du)(du/dx)',
                           'Integration by parts: ∫udv = uv - ∫vdu'],
                'applications': ['Physics motion', 'Economics optimization', 'Engineering problems']
            },
            'geometry': {
                'key_concepts': ['Points', 'Lines', 'Angles', 'Shapes', 'Transformations'],
                'formulas': ['Area of circle: A = πr²',
                           'Pythagorean theorem: a² + b² = c²',
                           'Volume of sphere: V = (4/3)πr³'],
                'applications': ['Architecture', 'Computer graphics', 'Navigation']
            }
        }
    },
    'science': {
        'name': 'Science',
        'topics': {
            'physics': {
                'key_concepts': ['Motion', 'Forces', 'Energy', 'Waves', 'Electricity'],
                'formulas': ['F = ma (Newton\'s second law)',
                           'E = mc² (Mass-energy equivalence)',
                           'v = fλ (Wave equation)'],
                'applications': ['Mechanical engineering', 'Electronics', 'Astrophysics']
            },
            'chemistry': {
                'key_concepts': ['Atoms', 'Molecules', 'Reactions', 'Bonds', 'Periodic table'],
                'formulas': ['PV = nRT (Ideal gas law)',
                           'pH = -log[H⁺]',
                           'ΔG = ΔH - TΔS'],
                'applications': ['Medicine', 'Materials science', 'Environmental science']
            },
            'biology': {
                'key_concepts': ['Cells', 'DNA', 'Evolution', 'Ecosystems', 'Photosynthesis'],
                'formulas': ['Hardy-Weinberg: p² + 2pq + q² = 1',
                           'Population growth: dN/dt = rN'],
                'applications': ['Medicine', 'Agriculture', 'Conservation']
            }
        }
    },
    'history': {
        'name': 'History',
        'topics': {
            'world_wars': {
                'key_concepts': ['Causes', 'Major battles', 'Key figures', 'Treaties', 'Aftermath'],
                'timeline': ['1914: WWI begins', '1918: WWI ends', '1939: WWII begins', '1945: WWII ends'],
                'figures': ['Winston Churchill', 'Adolf Hitler', 'Franklin Roosevelt', 'Joseph Stalin']
            },
            'ancient_civilizations': {
                'key_concepts': ['Egyptian', 'Greek', 'Roman', 'Mesopotamian', 'Chinese'],
                'achievements': ['Pyramids', 'Democracy', 'Roads', 'Writing', 'Philosophy']
            }
        }
    },
    'computer_science': {
        'name': 'Computer Science',
        'topics': {
            'programming': {
                'key_concepts': ['Variables', 'Loops', 'Functions', 'Classes', 'Data structures'],
                'languages': ['Python', 'Java', 'JavaScript', 'C++', 'Ruby'],
                'examples': ['def hello():\n    print("Hello World")']
            },
            'algorithms': {
                'key_concepts': ['Sorting', 'Searching', 'Recursion', 'Dynamic programming', 'Graphs'],
                'complexities': ['O(1) - Constant', 'O(log n) - Logarithmic', 'O(n) - Linear', 'O(n²) - Quadratic']
            },
            'web_development': {
                'key_concepts': ['HTML', 'CSS', 'JavaScript', 'Frameworks', 'Databases'],
                'technologies': ['React', 'Node.js', 'Django', 'Flask', 'MongoDB']
            }
        }
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Return list of available subjects"""
    subjects = []
    for key, value in KNOWLEDGE_BASE.items():
        subjects.append({
            'id': key,
            'name': value['name']
        })
    subjects.append({'id': 'general', 'name': 'General Studies'})
    return jsonify(subjects)

@app.route('/api/topics/<subject>', methods=['GET'])
def get_topics(subject):
    """Return topics for a specific subject"""
    if subject in KNOWLEDGE_BASE:
        topics = list(KNOWLEDGE_BASE[subject]['topics'].keys())
        return jsonify(topics)
    return jsonify(['general'])

@app.route('/api/generate-notes', methods=['POST'])
def generate_notes():
    try:
        data = request.json
        topic = data.get('topic', '').strip().lower()
        subject = data.get('subject', '').strip().lower()
        note_type = data.get('note_type', 'summary')
        
        if not topic:
            return jsonify({'error': 'Please enter a topic'}), 400
        
        # Generate comprehensive notes
        notes = create_detailed_notes(topic, subject, note_type)
        
        return jsonify({
            'success': True,
            'notes': notes,
            'topic': topic,
            'subject': subject,
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Failed to generate notes. Please try again.'}), 500

def create_detailed_notes(topic, subject, note_type):
    """Generate comprehensive study notes"""
    
    # Find relevant content from knowledge base
    subject_content = KNOWLEDGE_BASE.get(subject, {})
    topic_content = {}
    
    # Search for topic in knowledge base
    if subject_content and 'topics' in subject_content:
        for topic_key, content in subject_content['topics'].items():
            if topic_key in topic or topic in topic_key:
                topic_content = content
                break
    
    notes = {
        'title': f"{topic.title()} - Complete Study Guide",
        'subject': subject_content.get('name', subject.title() if subject else 'General'),
        'type': note_type.title(),
        'metadata': {
            'difficulty': random.choice(['Beginner', 'Intermediate', 'Advanced']),
            'reading_time': f"{random.randint(5, 15)} minutes",
            'sections': 5
        },
        'sections': []
    }
    
    if note_type == 'summary':
        notes['sections'] = create_summary_sections(topic, topic_content, subject)
    elif note_type == 'detailed':
        notes['sections'] = create_detailed_sections(topic, topic_content, subject)
    elif note_type == 'quick':
        notes['sections'] = create_quick_sections(topic, topic_content, subject)
    else:
        notes['sections'] = create_default_sections(topic, topic_content)
    
    return notes

def create_summary_sections(topic, content, subject):
    """Create summary-style notes"""
    sections = []
    
    # Key Concepts
    concepts = content.get('key_concepts', [
        f'Fundamental principles of {topic}',
        'Core theories and definitions',
        'Important terminology',
        'Basic applications'
    ])
    sections.append({
        'title': '🎯 Key Concepts',
        'type': 'concepts',
        'content': [f'• {concept}' for concept in concepts[:5]]
    })
    
    # Important Points
    formulas = content.get('formulas', content.get('timeline', content.get('achievements', [
        f'Point 1: Understanding {topic}',
        f'Point 2: Applications of {topic}',
        f'Point 3: Related concepts in {subject}',
        'Point 4: Common misconceptions'
    ])))
    sections.append({
        'title': '📋 Important Points',
        'type': 'points',
        'content': [f'• {formula}' for formula in formulas[:4]]
    })
    
    # Quick Reference
    applications = content.get('applications', content.get('figures', content.get('languages', [
        'Real-world applications',
        'Study tips and tricks',
        'Memory aids',
        'Practice suggestions'
    ])))
    sections.append({
        'title': '⚡ Quick Reference',
        'type': 'quick',
        'content': [f'• {app}' for app in applications[:4]]
    })
    
    return sections

def create_detailed_sections(topic, content, subject):
    """Create detailed study notes"""
    sections = []
    
    # Introduction
    sections.append({
        'title': '📚 Introduction',
        'type': 'intro',
        'content': [
            f"**Overview of {topic}**",
            f"**Subject Area**: {subject}",
            "**Learning Objectives**:",
            "  • Understand fundamental concepts",
            "  • Analyze complex applications",
            "  • Master key techniques",
            "  • Apply knowledge practically"
        ]
    })
    
    # Core Concepts
    concepts = content.get('key_concepts', [
        'Concept 1: Basic definition and principles',
        'Concept 2: Theoretical framework',
        'Concept 3: Practical implementation',
        'Concept 4: Advanced applications',
        'Concept 5: Current developments'
    ])
    sections.append({
        'title': '🔍 Core Concepts',
        'type': 'analysis',
        'content': [f"**{i+1}. {concept}**" for i, concept in enumerate(concepts[:5])]
    })
    
    # Detailed Explanation
    details = content.get('formulas', content.get('timeline', content.get('achievements', [
        f'**Section A**: Theoretical foundations of {topic}',
        f'**Section B**: Practical applications',
        f'**Section C**: Case studies and examples',
        f'**Section D**: Common challenges and solutions'
    ])))
    sections.append({
        'title': '📝 Detailed Explanation',
        'type': 'examples',
        'content': [detail for detail in details[:6]]
    })
    
    # Examples and Applications
    applications = content.get('applications', content.get('figures', content.get('technologies', [
        f'**Example 1**: Real-world application of {topic}',
        '**Example 2**: Problem-solving scenario',
        '**Example 3**: Advanced case study',
        '**Practice Exercise**: Apply your knowledge'
    ])))
    sections.append({
        'title': '💡 Examples & Applications',
        'type': 'practice',
        'content': applications[:4]
    })
    
    return sections

def create_quick_sections(topic, content, subject):
    """Create quick reference notes"""
    sections = []
    
    # Quick Facts
    sections.append({
        'title': '⚡ Quick Facts',
        'type': 'quick',
        'content': [
            f"**Topic**: {topic}",
            f"**Subject**: {subject}",
            "**Difficulty**: " + random.choice(['Easy', 'Medium', 'Hard']),
            "**Time to Learn**: " + random.choice(['1-2 hours', '3-4 hours', '5+ hours']),
            "**Prerequisites**: Basic understanding of " + subject
        ]
    })
    
    # Key Points
    concepts = content.get('key_concepts', [
        f'Point 1: Essential concept of {topic}',
        'Point 2: Key principle to remember',
        'Point 3: Important relationship',
        'Point 4: Critical application'
    ])
    sections.append({
        'title': '🔑 Key Points',
        'type': 'points',
        'content': [f'• {concept}' for concept in concepts[:4]]
    })
    
    # Memory Aids
    sections.append({
        'title': '🧠 Memory Aids',
        'type': 'memory',
        'content': [
            "• **Mnemonic**: Create a memorable acronym",
            "• **Visual**: Draw a quick diagram",
            "• **Connection**: Link to familiar concepts",
            "• **Story**: Create a narrative",
            "• **Rhythm**: Make it musical"
        ]
    })
    
    # Quick Tips
    sections.append({
        'title': '💡 Quick Tips',
        'type': 'tips',
        'content': [
            "• Review these notes daily",
            "• Practice with flashcards",
            "• Teach someone else",
            "• Take regular breaks",
            "• Test yourself frequently"
        ]
    })
    
    return sections

def create_default_sections(topic, content):
    """Create default notes when no specific content found"""
    return [
        {
            'title': '📖 Overview',
            'type': 'overview',
            'content': [
                f"**Topic**: {topic}",
                "**Category**: General Study",
                "**Purpose**: Comprehensive learning material",
                "**Target Audience**: Students and self-learners"
            ]
        },
        {
            'title': '🎯 Learning Objectives',
            'type': 'objectives',
            'content': [
                "• Understand the basic concepts",
                "• Identify key components and relationships",
                "• Apply knowledge to practical situations",
                "• Analyze complex scenarios",
                "• Evaluate different perspectives"
            ]
        },
        {
            'title': '📝 Study Guide',
            'type': 'general',
            'content': [
                f"**Section 1**: Introduction to {topic}",
                "  • Historical background",
                "  • Current relevance",
                "  • Future potential",
                "",
                f"**Section 2**: Core elements of {topic}",
                "  • Fundamental principles",
                "  • Key terminology",
                "  • Important relationships",
                "",
                f"**Section 3**: Applications of {topic}",
                "  • Real-world examples",
                "  • Case studies",
                "  • Practical exercises"
            ]
        },
        {
            'title': '✅ Review Questions',
            'type': 'practice',
            'content': [
                f"1. What are the main concepts of {topic}?",
                f"2. How does {topic} apply in real life?",
                "3. What are the key challenges?",
                "4. How would you explain this to someone else?",
                "5. Create a mind map of the topic"
            ]
        }
    ]

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)