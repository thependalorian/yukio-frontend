'use client'

import { Download, FileText, FileCode } from 'lucide-react'
import { useState } from 'react'

interface ResumeSection {
  section_name: string
  section_name_jp: string
  content: string
  content_jp?: string
}

interface ResumeDisplayProps {
  sections: ResumeSection[]
  documentType?: string
  jobTitle?: string
  companyName?: string
}

export function ResumeDisplay({ sections, documentType, jobTitle, companyName }: ResumeDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName)
    } else {
      newExpanded.add(sectionName)
    }
    setExpandedSections(newExpanded)
  }

  const downloadAsText = () => {
    let content = `履歴書 (Rirekisho) - ${documentType || 'resume'}\n`
    if (jobTitle) content += `Job Title: ${jobTitle}\n`
    if (companyName) content += `Company: ${companyName}\n`
    content += '\n' + '='.repeat(60) + '\n\n'

    sections.forEach((section) => {
      content += `${section.section_name_jp} (${section.section_name})\n`
      content += '-'.repeat(60) + '\n'
      content += section.content_jp || section.content
      content += '\n\n'
    })

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rirekisho_${documentType || 'resume'}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAsMarkdown = () => {
    let content = `# 履歴書 (Rirekisho) - ${documentType || 'resume'}\n\n`
    if (jobTitle) content += `**Job Title:** ${jobTitle}\n\n`
    if (companyName) content += `**Company:** ${companyName}\n\n`
    content += '---\n\n'

    sections.forEach((section) => {
      content += `## ${section.section_name_jp} (${section.section_name})\n\n`
      content += section.content_jp || section.content
      content += '\n\n---\n\n'
    })

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rirekisho_${documentType || 'resume'}_${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-bg-elevated border border-bg-elevated rounded-lg p-4 my-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            📝 {documentType === 'rirekisho' ? '履歴書 (Rirekisho)' : 
                 documentType === 'shokumu-keirekisho' ? '職務経歴書 (Shokumu-keirekisho)' :
                 'Resume Document'}
          </h3>
          {jobTitle && (
            <p className="text-sm text-text-secondary mt-1">For: {jobTitle} {companyName && `at ${companyName}`}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadAsText}
            className="px-3 py-1.5 bg-bg-card hover:bg-bg-elevated text-text-primary rounded-lg transition-colors text-sm flex items-center gap-1.5"
            title="Download as TXT"
          >
            <FileText className="w-4 h-4" />
            TXT
          </button>
          <button
            onClick={downloadAsMarkdown}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm flex items-center gap-1.5"
            title="Download as Markdown"
          >
            <FileCode className="w-4 h-4" />
            MD
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.section_name)
          return (
            <div
              key={index}
              className="border-b border-bg-elevated pb-3 last:border-b-0 last:pb-0"
            >
              <button
                onClick={() => toggleSection(section.section_name)}
                className="w-full text-left flex justify-between items-center hover:bg-bg-card rounded p-2 -m-2 transition-colors"
              >
                <h4 className="font-semibold text-text-primary">
                  {section.section_name_jp} ({section.section_name})
                </h4>
                <span className="text-text-tertiary text-sm">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>
              {isExpanded && (
                <div className="mt-2 pl-2 text-text-primary whitespace-pre-wrap text-sm leading-relaxed">
                  {section.content_jp || section.content}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

