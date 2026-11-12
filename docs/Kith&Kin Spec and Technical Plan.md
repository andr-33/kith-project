# Kith&Kin: Spec and Technical Plan

Nov 12, 2026 · @Andreé

## Summary

Kith&Kin v1 is a private, invite-only mobile website, installable on the home screen, where family members post photos and short videos and the grandparents follow along in a very simple viewer mode. It is English only, built with React, Supabase and Vercel, aimed at four weeks of work and close to zero hosting cost.

- **Who:** one private family circle, 3 people today (you and two grandparents), with room for a few more.
- **Grandparents:** mostly watch, react and comment, using a separate simple screen.
- **Devices:** iPhone 12 or newer and a computer, with good Wi-Fi at home.
- **Posts:** several photos and/or a video of up to 15 seconds, caption required, newest first, one big post at a time, a marker for what is new since the last visit, and edit and delete for authors.
- **Reactions:** Love, Haha, Wow, Like, Dislike and What?, the poster sees who reacted by name, and people can leave short written comments.
- **Access:** people join through an invitation link or code, grandparents log in with a PIN, and there are no notifications.
- **Admin:** you plus one or two relatives can delete or hide any post, and an export button downloads every photo. Removing a person deletes their posts.
- **Success:** the family posts about their lives and the grandparents stay up to date.

There are two permission levels (member and admin) and two screen modes (simple and full). A grandparent is a member whose screen mode is simple, so the grandparents can still post later without a new account type.

| Role | Who | Can do |
| --- | --- | --- |
| Member | Family and grandparents | Post, edit and delete their own posts and comments, react, comment, view every profile, edit their own nickname and photo. |
| Admin | You at first, later one or two relatives | Everything a member can do, plus delete or hide any post or comment, create invitation links, reset a PIN, remove a person, switch a person's screen mode, and export all photos. |

| Screen mode | Who sees it | What it looks like |
| --- | --- | --- |
| Simple | The grandparents | One big post at a time, large reaction buttons, a single comment button, no posting button, no menus. |
| Full | Everyone else | A feed of big cards, the new-post button, profiles, and the admin area for admins. |

## Features and rules

| Feature | Rule |
| --- | --- |
| Invitations | An admin creates a single-use link or code that expires after 7 days (my pick) and sets whether the new person starts in simple or full mode. |
| Login | Email and a 6-digit PIN. The session stays active, and the app asks to be added to the home screen. |
| New post | 1 to 6 items, at most one video of 15 seconds. A caption is required, up to 300 characters (my pick). Photos are resized on the phone before upload. |
| Feed | Newest first. Simple mode shows one big post at a time. Full mode shows big cards, 10 at a time (my pick). |
| New marker | A post is new if it was created after the person's last visit. The last visit updates when they leave the feed. |
| Edit and delete | Authors edit their caption and delete their post, which also deletes its files. |
| Reactions | One per person per post: Love, Haha, Wow, Like, Dislike or What?. Tapping again removes or changes it. The poster sees names. |
| Comments | Short text up to 300 characters. Authors delete their own and admins delete any. |
| Profiles | A nickname and a photo, visible to everyone in the family and editable only by their owner. |
| Admin | Delete or hide any post or comment, reset a PIN, remove a person (their posts and comments are deleted), and export all photos and videos with their captions. |

Not in v1: notifications, flagging a post, several families, and languages other than English.

## UX rules for the grandparents

The grandparents use WhatsApp with some help and need reading glasses, so simple mode follows these rules from the first screen. Sizes are my starting values; adjust them after the test in week 2.

- **Text:** large from the start, as you chose. Body text at least 20 px, captions 22 px, headings 28 px. A "Bigger text" button on the profile page raises everything one more step.
- **Contrast:** dark text on a plain light background, at least 7:1. No grey-on-grey and no text over photos.
- **Touch targets:** at least 56 px tall with space between them. The six reactions are big buttons showing the emoji and its word.
- **One thing per screen:** no menus, no swipe-only actions and no icons without a word next to them.
- **Plain language:** errors say what to do, for example "That PIN is not right. Try again." No codes and no technical words.
- **Login:** a number keypad for the PIN, and the app stays logged in on their phone.
- **Posting (for you and the admins):** a progress bar during upload and a retry button when the connection drops, so no post is lost.

## Architecture and stack

A static React app talks directly to one Supabase project, so there is no server of your own to run.

&#91;embedded content: architecture · 2 hosts, 4 Supabase services\]

Vercel only serves the app files. After that, every request goes to Supabase, which handles login, data, files and the two admin actions.

| Layer | Choice | Why |
| --- | --- | --- |
| Screens | React with Vite | A static app is enough, because Supabase does the server work. |
| Look | Tailwind CSS with large-text design tokens | One place to set the sizes from the UX rules. |
| Data | Supabase JS client | Loads the feed and keeps it fresh without custom server code. |
| Home-screen install | vite-plugin-pwa | Adds the icon and full-screen mode. No offline posting. |
| Photos | browser-image-compression | Resizes photos on the phone before upload. |
| PIN login | Supabase email and password, with the PIN as the password | Supabase has no PIN mode. I believe its default minimum password length is 6, which fits a 6-digit PIN; confirm in the Auth settings. |

## Data model and access rules

Six Postgres tables hold everything, and row level security on each one decides who can read and write. Nothing is public: every request needs a signed-in family member.

| Table | Main columns | Who can do what |
| --- | --- | --- |
| profiles | id (the auth user), nickname, avatar\_path, role (member or admin), screen\_mode (simple or full), last\_seen\_at | Everyone signed in reads. The owner edits nickname and photo. Admins change role and screen mode. |
| invites | code, role, screen\_mode, created\_by, expires\_at, used\_by | Admins only. |
| posts | id, author\_id, caption, hidden, created\_at, updated\_at | Everyone reads visible posts. Members create their own. Authors edit the caption and delete. Admins hide and delete any. |
| post\_media | id, post\_id, kind (photo or video), path, width, height, position | Follows the rules of its post. |
| reactions | post\_id, user\_id, kind (love, haha, wow, like, dislike, what), one row per person per post | Everyone reads. People write and remove only their own. |
| comments | id, post\_id, author\_id, body, hidden, created\_at | Everyone reads. Members create their own. Authors delete their own and admins delete any. |

**Files.** One private storage bucket holds photos and videos under `posts/<post_id>/`. The app reads them through signed links that expire after one hour, and only signed-in members can upload into their own posts.

**Invitations.** A database trigger runs on every sign-up. It rejects the sign-up unless the code is valid, unused and not expired, then creates the profile with the role and screen mode stored on the invite. Email confirmation is off, because the invitation code is the gate.

**Admin actions that need more power.** Resetting a PIN and removing a person run in a small Supabase Edge Function that checks the caller is an admin. Removing a person deletes their user, and cascading deletes remove their posts, reactions and comments. The function also deletes their files.

**Export.** An admin's browser downloads every file through signed links and zips them with a captions text file.
