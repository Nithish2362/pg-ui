import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  NumberInput,
  Button,
  Avatar,
  Group,
  Stack,
  Divider,
  ActionIcon,
  Badge,
} from '@mantine/core';
import { IconMail, IconPhone, IconCalendar, IconEdit, IconCheck, IconX, IconLock, IconUser } from '@tabler/icons-react';
import api from '../../api/Interceptor';
import { END_POINTS } from '../../api/EndPoints';
import notify from '../utils/Notification';

const Profile = () => {
  const userSession = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    age: '',
    role: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${END_POINTS.USER_PROFILE}?username=${userSession.username}`);
      setProfile(res.data.response);
    } catch (err) {
      notify({
        title: 'Error',
        message: 'Failed to fetch profile details',
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await api.post(END_POINTS.USER_UPDATE_PROFILE, profile);
      notify({
        title: 'Success',
        message: 'Profile updated successfully',
        success: true,
      });
      setEditing(false);
      // Update local storage name if changed
      const updatedUser = { ...userSession, name: profile.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Trigger a page refresh or custom event if header needs to update immediately
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      notify({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to update profile',
        success: false,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder style={{ background: 'white' }}>
        <Group justify="space-between" mb="xl">
          <Group>
            <Avatar size={80} radius="xl" color="var(--gold)" src={null} style={{ border: '2px solid var(--gold)' }}>
              {profile.fullName?.charAt(0) || profile.username?.charAt(0)}
            </Avatar>
            <div>
              <Title order={2} style={{ fontFamily: 'var(--font-heading)' }}>{profile.fullName || 'User Profile'}</Title>
              <Group gap="xs">
                <Badge color="dark" variant="filled" style={{ backgroundColor: 'var(--gold)' }}>{profile.role}</Badge>
                <Text size="sm" c="dimmed">@{profile.username}</Text>
              </Group>
            </div>
          </Group>
          {!editing ? (
            <Button
              variant="outline"
              color="var(--gold)"
              leftSection={<IconEdit size={16} />}
              onClick={() => setEditing(true)}
              style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
            >
              Edit Profile
            </Button>
          ) : (
            <Group gap="xs">
              <ActionIcon variant="light" color="red" size="lg" onClick={() => setEditing(false)}>
                <IconX size={20} />
              </ActionIcon>
              <ActionIcon variant="filled" color="var(--gold)" size="lg" loading={saving} onClick={handleUpdate} style={{ backgroundColor: 'var(--gold)' }}>
                <IconCheck size={20} />
              </ActionIcon>
            </Group>
          )}
        </Group>

        <Divider mb="xl" />

        <Stack gap="md">
          <TextInput
            label="Full Name"
            placeholder="Your full name"
            value={profile.fullName || ''}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            readOnly={!editing}
            leftSection={<IconUser size={18} color="var(--gold)" />}
            styles={{ input: { borderRadius: '12px' } }}
          />

          <TextInput
            label="Email Address"
            placeholder="email@example.com"
            value={profile.email || ''}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            readOnly={!editing}
            leftSection={<IconMail size={18} color="var(--gold)" />}
            styles={{ input: { borderRadius: '12px' } }}
          />

          <TextInput
            label="Mobile Number"
            placeholder="10 digit number"
            value={profile.mobileNumber || ''}
            onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
            readOnly={!editing}
            leftSection={<IconPhone size={18} color="var(--gold)" />}
            styles={{ input: { borderRadius: '12px' } }}
          />

          <NumberInput
            label="Age"
            placeholder="Your age"
            value={profile.age || ''}
            onChange={(val) => setProfile({ ...profile, age: val })}
            readOnly={!editing}
            leftSection={<IconCalendar size={18} color="var(--gold)" />}
            styles={{ input: { borderRadius: '12px' } }}
          />

          <TextInput
            label="Username"
            value={profile.username}
            readOnly
            disabled
            leftSection={<IconLock size={18} />}
            description="Username cannot be changed"
            styles={{ input: { borderRadius: '12px', backgroundColor: '#f9f9f9' } }}
          />
        </Stack>

        {editing && (
          <Button
            fullWidth
            mt="xl"
            loading={saving}
            onClick={handleUpdate}
            style={{ backgroundColor: 'var(--gold)', borderRadius: '12px', height: '48px' }}
          >
            Save Changes
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
