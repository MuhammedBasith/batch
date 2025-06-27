
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Download, Users, Shuffle, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Group {
  id: number;
  members: string[];
}

const Index = () => {
  const [totalParticipants, setTotalParticipants] = useState<number>(10);
  const [teamSize, setTeamSize] = useState<number>(2);
  const [suspenseMode, setSuspenseMode] = useState<boolean>(false);
  const [useCustomNames, setUseCustomNames] = useState<boolean>(false);
  const [customNames, setCustomNames] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [revealedGroups, setRevealedGroups] = useState<number>(0);
  const [groupPrefix, setGroupPrefix] = useState<string>('Team');

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('batch-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTotalParticipants(settings.totalParticipants || 10);
      setTeamSize(settings.teamSize || 2);
      setSuspenseMode(settings.suspenseMode || false);
      setUseCustomNames(settings.useCustomNames || false);
      setCustomNames(settings.customNames || '');
      setGroupPrefix(settings.groupPrefix || 'Team');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        generateGroups();
      } else if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        reshuffleGroups();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      totalParticipants,
      teamSize,
      suspenseMode,
      useCustomNames,
      customNames,
      groupPrefix
    };
    localStorage.setItem('batch-settings', JSON.stringify(settings));
  };

  // Create confetti effect
  const createConfetti = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = Math.random() * 2 + 3 + 's';
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  };

  const getParticipantsList = () => {
    if (useCustomNames && customNames.trim()) {
      const names = customNames
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      return names;
    } else {
      return Array.from({ length: totalParticipants }, (_, i) => `Person ${i + 1}`);
    }
  };

  const generateGroups = () => {
    if (teamSize <= 0) {
      toast({
        title: "Invalid team size",
        description: "Team size must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    const participants = getParticipantsList();
    
    if (participants.length === 0) {
      toast({
        title: "No participants",
        description: "Please add at least one participant",
        variant: "destructive"
      });
      return;
    }

    // Shuffle participants
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    // Create groups with even distribution
    const newGroups: Group[] = [];
    let groupId = 1;
    
    const totalGroups = Math.ceil(shuffled.length / teamSize);
    const groupSizes = Array(totalGroups).fill(Math.floor(shuffled.length / totalGroups));
    const remainder = shuffled.length % totalGroups;
    
    // Distribute remainder
    for (let i = 0; i < remainder; i++) {
      groupSizes[i]++;
    }
    
    let participantIndex = 0;
    groupSizes.forEach(size => {
      const members = shuffled.slice(participantIndex, participantIndex + size);
      newGroups.push({ id: groupId++, members });
      participantIndex += size;
    });

    setGroups(newGroups);
    setRevealedGroups(0);
    setIsGenerating(true);
    saveSettings();

    if (suspenseMode) {
      // Reveal groups one by one
      let revealed = 0;
      const interval = setInterval(() => {
        revealed++;
        setRevealedGroups(revealed);
        
        if (revealed >= newGroups.length) {
          clearInterval(interval);
          setIsGenerating(false);
          createConfetti();
        }
      }, 800);
    } else {
      // Show all groups immediately
      setRevealedGroups(newGroups.length);
      setIsGenerating(false);
      createConfetti();
    }

    toast({
      title: "Groups generated!",
      description: `Created ${newGroups.length} ${groupPrefix.toLowerCase()}s successfully`,
    });
  };

  const reshuffleGroups = () => {
    if (groups.length === 0) return;
    generateGroups();
  };

  const downloadGroups = () => {
    if (groups.length === 0) return;

    const content = groups
      .map(group => `${groupPrefix} ${group.id}:\n${group.members.map(member => `- ${member}`).join('\n')}`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch-groups.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Groups saved as batch-groups.txt",
    });
  };

  const effectiveParticipantCount = getParticipantsList().length;
  const estimatedGroups = Math.ceil(effectiveParticipantCount / teamSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Modern flowing gradient background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
              linear-gradient(135deg, rgba(30, 30, 60, 0.8) 0%, rgba(60, 30, 90, 0.8) 100%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Shuffle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-white">Batch</h1>
          </div>
          <p className="text-2xl text-white/80 mb-2">Beautifully random.</p>
          <p className="text-lg text-white/60">
            Press Ctrl+Enter to generate • Ctrl+R to reshuffle
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[450px_1fr] gap-8 items-start">
            {/* Input Panel - Fixed width */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-fade-in animation-delay-200">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <Users className="w-6 h-6" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Settings */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-names" className="text-white/90 text-lg">Use custom names</Label>
                  <Switch
                    id="custom-names"
                    checked={useCustomNames}
                    onCheckedChange={setUseCustomNames}
                  />
                </div>

                {useCustomNames ? (
                  <div className="space-y-3">
                    <Label htmlFor="names" className="text-white/90 text-lg">
                      Participant names (one per line)
                    </Label>
                    <Textarea
                      id="names"
                      placeholder="Alice&#10;Bob&#10;Charlie&#10;Diana"
                      value={customNames}
                      onChange={(e) => setCustomNames(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 resize-none text-lg"
                      rows={6}
                    />
                    <p className="text-lg text-white/60">
                      {getParticipantsList().length} participants
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="participants" className="text-white/90 text-lg">Total participants</Label>
                    <Input
                      id="participants"
                      type="number"
                      min="1"
                      value={totalParticipants}
                      onChange={(e) => setTotalParticipants(Number(e.target.value))}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 text-lg"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="team-size" className="text-white/90 text-lg">Team size</Label>
                  <Input
                    id="team-size"
                    type="number"
                    min="1"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="group-prefix" className="text-white/90 text-lg">Group name prefix</Label>
                  <Input
                    id="group-prefix"
                    value={groupPrefix}
                    onChange={(e) => setGroupPrefix(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 text-lg"
                    placeholder="Team"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="suspense-mode" className="text-white/90 text-lg">Suspense mode</Label>
                    <p className="text-base text-white/60">Reveal teams one by one</p>
                  </div>
                  <Switch
                    id="suspense-mode"
                    checked={suspenseMode}
                    onCheckedChange={setSuspenseMode}
                  />
                </div>

                {/* Stats */}
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <p className="text-white/80 text-lg">
                    <span className="font-medium">Estimated groups:</span> {estimatedGroups}
                  </p>
                  <p className="text-white/80 text-lg">
                    <span className="font-medium">Active participants:</span> {effectiveParticipantCount}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={generateGroups}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-4 text-lg transition-all duration-300 hover:scale-105 border-0"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Generate Groups
                      </div>
                    )}
                  </Button>

                  {groups.length > 0 && (
                    <Button
                      onClick={reshuffleGroups}
                      variant="outline"
                      className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 py-4 text-lg"
                    >
                      <Shuffle className="w-5 h-5 mr-2" />
                      Reshuffle
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Panel - Flexible width */}
            <div className="space-y-6 min-h-0">
              {groups.length > 0 && (
                <div className="flex items-center justify-between animate-fade-in">
                  <h2 className="text-3xl font-bold text-white">Generated {groupPrefix}s</h2>
                  <Button
                    onClick={downloadGroups}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </Button>
                </div>
              )}

              <div className="grid gap-4">
                {groups.map((group, index) => (
                  <Card
                    key={group.id}
                    className={`bg-white/10 backdrop-blur-md border-white/20 transition-all duration-500 ${
                      index < revealedGroups 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-4'
                    }`}
                    style={{ 
                      transitionDelay: suspenseMode ? `${index * 100}ms` : '0ms' 
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-bold">
                          {group.id}
                        </div>
                        {groupPrefix} {group.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {group.members.map((member, memberIndex) => (
                          <div
                            key={memberIndex}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                          >
                            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                            <span className="text-white/90 text-lg">{member}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {groups.length === 0 && (
                <Card className="bg-white/5 backdrop-blur-md border-white/10 border-dashed animate-fade-in">
                  <CardContent className="text-center py-16">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-white/50" />
                    </div>
                    <p className="text-white/60 text-xl">Your generated groups will appear here</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
