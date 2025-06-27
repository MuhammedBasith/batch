
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      totalParticipants,
      teamSize,
      suspenseMode,
      useCustomNames,
      customNames
    };
    localStorage.setItem('batch-settings', JSON.stringify(settings));
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

    let participants: string[] = [];
    
    if (useCustomNames && customNames.trim()) {
      participants = customNames
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      if (participants.length === 0) {
        toast({
          title: "No valid names",
          description: "Please enter at least one name",
          variant: "destructive"
        });
        return;
      }
    } else {
      participants = Array.from({ length: totalParticipants }, (_, i) => `Person ${i + 1}`);
    }

    // Shuffle participants
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    // Create groups
    const newGroups: Group[] = [];
    let groupId = 1;
    
    for (let i = 0; i < shuffled.length; i += teamSize) {
      const members = shuffled.slice(i, i + teamSize);
      newGroups.push({ id: groupId++, members });
    }

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
        }
      }, 800);
    } else {
      // Show all groups immediately
      setRevealedGroups(newGroups.length);
      setIsGenerating(false);
    }

    toast({
      title: "Groups generated!",
      description: `Created ${newGroups.length} teams successfully`,
    });
  };

  const downloadGroups = () => {
    if (groups.length === 0) return;

    const content = groups
      .map(group => `Team ${group.id}:\n${group.members.map(member => `- ${member}`).join('\n')}`)
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

  const effectiveParticipantCount = useCustomNames && customNames.trim() 
    ? customNames.split('\n').filter(name => name.trim().length > 0).length 
    : totalParticipants;

  const estimatedGroups = Math.ceil(effectiveParticipantCount / teamSize);
  const remainder = effectiveParticipantCount % teamSize;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
              <Shuffle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">Batch</h1>
          </div>
          <p className="text-xl text-white/80">Beautifully random.</p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-fade-in animation-delay-200">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Custom Names Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="custom-names" className="text-white/90">Use custom names</Label>
                <Switch
                  id="custom-names"
                  checked={useCustomNames}
                  onCheckedChange={setUseCustomNames}
                />
              </div>

              {useCustomNames ? (
                <div className="space-y-2">
                  <Label htmlFor="names" className="text-white/90">
                    Participant names (one per line)
                  </Label>
                  <textarea
                    id="names"
                    placeholder="Alice&#10;Bob&#10;Charlie&#10;Diana"
                    value={customNames}
                    onChange={(e) => setCustomNames(e.target.value)}
                    className="w-full h-32 bg-white/10 border-white/20 text-white placeholder-white/50 resize-none rounded-md p-3"
                    rows={6}
                  />
                  <p className="text-sm text-white/60">
                    {customNames.split('\n').filter(name => name.trim().length > 0).length} participants
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="participants" className="text-white/90">Total participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    min="1"
                    value={totalParticipants}
                    onChange={(e) => setTotalParticipants(Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="team-size" className="text-white/90">Team size</Label>
                <Input
                  id="team-size"
                  type="number"
                  min="1"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="bg-white/10 border-white/20 text-white placeholder-white/50"
                />
              </div>

              <Separator className="bg-white/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="suspense-mode" className="text-white/90">Suspense mode</Label>
                  <p className="text-sm text-white/60">Reveal teams one by one</p>
                </div>
                <Switch
                  id="suspense-mode"
                  checked={suspenseMode}
                  onCheckedChange={setSuspenseMode}
                />
              </div>

              {/* Stats */}
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <p className="text-white/80 text-sm">
                  <span className="font-medium">Estimated groups:</span> {estimatedGroups}
                </p>
                {remainder > 0 && (
                  <p className="text-white/80 text-sm">
                    <span className="font-medium">Remaining participants:</span> {remainder}
                  </p>
                )}
              </div>

              <Button 
                onClick={generateGroups}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 transition-all duration-300 hover:scale-105"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Groups
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-6">
            {groups.length > 0 && (
              <div className="flex items-center justify-between animate-fade-in">
                <h2 className="text-2xl font-bold text-white">Generated Teams</h2>
                <Button
                  onClick={downloadGroups}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
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
                    <CardTitle className="text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {group.id}
                      </div>
                      Team {group.id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {group.members.map((member, memberIndex) => (
                        <div
                          key={memberIndex}
                          className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                          <span className="text-white/90">{member}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {groups.length === 0 && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10 border-dashed animate-fade-in">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-white/60">Your generated groups will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
