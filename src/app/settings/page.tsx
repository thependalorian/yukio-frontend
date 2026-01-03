'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui'
import { User, Bell, Volume2, Monitor, Target, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: 'George',
    dailyGoal: 20,
    notifications: true,
    ttsEnabled: true,
    ttsSpeed: 1.0,
    autoPlayAudio: true,
    showFurigana: true,
    showRomaji: false,
    theme: 'dark',
    jlptFocus: 'N5',
  })

  const handleSave = () => {
    // TODO: Save to backend
    toast.success('Settings saved!')
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      toast.success('Progress reset (this would call the backend)')
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
          <p className="text-text-secondary">Customize your learning experience</p>
        </motion.div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-card border border-bg-elevated rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-sakura" />
            <h2 className="text-xl font-bold">Profile</h2>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-2 bg-bg-elevated border border-bg-card rounded-lg text-text-primary focus:outline-none focus:border-sakura"
            />
          </div>
        </motion.div>

        {/* Learning Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-card border border-bg-elevated rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-indigo" />
            <h2 className="text-xl font-bold">Learning Goals</h2>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Daily Goal: {settings.dailyGoal} minutes
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={settings.dailyGoal}
              onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-tertiary mt-1">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">JLPT Focus</label>
            <select
              value={settings.jlptFocus}
              onChange={(e) => setSettings({ ...settings, jlptFocus: e.target.value })}
              className="w-full px-4 py-2 bg-bg-elevated border border-bg-card rounded-lg text-text-primary focus:outline-none focus:border-sakura"
            >
              <option value="N5">N5 (Beginner)</option>
              <option value="N4">N4 (Elementary)</option>
              <option value="N3">N3 (Intermediate)</option>
              <option value="N2">N2 (Upper Intermediate)</option>
              <option value="N1">N1 (Advanced)</option>
            </select>
          </div>
        </motion.div>

        {/* Audio Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-card border border-bg-elevated rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-5 h-5 text-sakura" />
            <h2 className="text-xl font-bold">Audio Settings</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable Text-to-Speech</span>
              <input
                type="checkbox"
                checked={settings.ttsEnabled}
                onChange={(e) => setSettings({ ...settings, ttsEnabled: e.target.checked })}
                className="w-5 h-5 rounded"
              />
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">
                Playback Speed: {settings.ttsSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.25"
                value={settings.ttsSpeed}
                onChange={(e) => setSettings({ ...settings, ttsSpeed: parseFloat(e.target.value) })}
                className="w-full"
                disabled={!settings.ttsEnabled}
              />
              <div className="flex justify-between text-xs text-text-tertiary mt-1">
                <span>0.5x</span>
                <span>1x</span>
                <span>2x</span>
              </div>
            </div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-play audio</span>
              <input
                type="checkbox"
                checked={settings.autoPlayAudio}
                onChange={(e) => setSettings({ ...settings, autoPlayAudio: e.target.checked })}
                className="w-5 h-5 rounded"
                disabled={!settings.ttsEnabled}
              />
            </label>
          </div>
        </motion.div>

        {/* Display Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-card border border-bg-elevated rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="w-5 h-5 text-indigo" />
            <h2 className="text-xl font-bold">Display Settings</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Always show furigana</span>
              <input
                type="checkbox"
                checked={settings.showFurigana}
                onChange={(e) => setSettings({ ...settings, showFurigana: e.target.checked })}
                className="w-5 h-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Show romaji</span>
              <input
                type="checkbox"
                checked={settings.showRomaji}
                onChange={(e) => setSettings({ ...settings, showRomaji: e.target.checked })}
                className="w-5 h-5 rounded"
              />
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="w-full px-4 py-2 bg-bg-elevated border border-bg-card rounded-lg text-text-primary focus:outline-none focus:border-sakura"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-bg-card border border-bg-elevated rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-warning" />
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              className="w-5 h-5 rounded"
            />
          </label>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-bg-card border border-wrong rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-wrong" />
            <h2 className="text-xl font-bold text-wrong">Danger Zone</h2>
          </div>
          <p className="text-sm text-text-secondary">
            Reset all your progress. This action cannot be undone.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-wrong text-white rounded-lg font-semibold hover:bg-wrong/80 transition-colors"
          >
            Reset Progress
          </button>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-sakura text-sumi rounded-lg font-semibold hover:bg-sakura-dark transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}

