import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useDepartments } from '@/hooks/useDepartments';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, LogOut, ChevronDown, RefreshCw, Play, Shield } from 'lucide-react';

interface ProfileDropdownProps {
  onReplayTour?: () => void;
}

export function ProfileDropdown({ onReplayTour }: ProfileDropdownProps = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, signOut, updateProfile } = useAuth();
  const { isAdmin } = useUserRole();
  const { departments: deptOptions } = useDepartments();
  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    job_role: '',
    department: '',
  });

  const handleOpenProfile = () => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        job_role: profile.job_role || '',
        department: profile.department || '',
      });
    }
    setProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!formData.display_name.trim()) {
      toast({ title: 'Name required', description: 'Please enter your name.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await updateProfile({
      display_name: formData.display_name.trim(),
      job_role: formData.job_role.trim() || null,
      department: formData.department || null,
    });
    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
      setProfileOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleRetakeIntake = async () => {
    // Reset onboarding_completed to false so user goes through onboarding again
    const { error } = await updateProfile({ onboarding_completed: false });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Intake Form', description: 'Redirecting to the intake form...' });
      navigate('/onboarding');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="hidden sm:inline max-w-24 truncate">
              {profile?.display_name || 'User'}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile?.display_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.job_role || 'No role set'}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOpenProfile} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </DropdownMenuItem>
          {onReplayTour && (
            <DropdownMenuItem onClick={onReplayTour} className="cursor-pointer">
              <Play className="mr-2 h-4 w-4" />
              Replay Tour
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleRetakeIntake} className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retake Intake Form
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              Admin Settings
            </DropdownMenuItem>
          )}
          {profile?.is_super_admin && (
            <DropdownMenuItem onClick={() => navigate('/super-admin')} className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4 text-primary" />
              Super Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-role">Job Title / Role</Label>
              <Input
                id="profile-role"
                value={formData.job_role}
                onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                placeholder="e.g. Senior Analyst, VP of Finance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-lob">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger id="profile-lob">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent className="bg-card max-h-60">
                  {deptOptions.map((dept) => (
                    <SelectItem key={dept.slug} value={dept.slug}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
