<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

## Showing Status or Progress of the `mv` Command in Linux

The standard `mv` command in Linux does not provide a built-in progress bar or detailed status updates. By default, it operates silently unless there is an error. However, there are several ways to monitor or display the status of a move operation, especially for large files or directories.

---

**Verbose Output with `-v` Option**

- Using `mv -v` (or `--verbose`) will print the name of each file as it is moved. This does not show a progress bar, but it does provide a basic status update for each file completed[^1_2][^1_5][^1_7].

```bash
mv -v source target
```


---

**Monitoring Progress with External Tools**

For more detailed progress (including percentage or speed), you can use additional tools:

### 1. `progress` Utility

- The `progress` tool can monitor the progress of coreutils commands like `mv`, `cp`, and `dd` by tracking their file descriptors.
- To use it:

1. Start your `mv` command as usual.
2. In another terminal, run `progress` to see the current status[^1_1][^1_3][^1_4].
```bash
mv largefile /destination/
# In another terminal
progress
```

- For live updates with ETA, use:

```bash
progress -w
```

- To monitor a specific backgrounded process:

```bash
mv largefile /destination/ & progress -mp $!
```

- To continuously watch all running operations:

```bash
watch progress -q
```

The `progress` utility is not installed by default; you can install it from your distribution's repositories or build it from source[^1_4].

---

### 2. Using `rsync` as an Alternative

- If you need a true progress bar and are moving data between filesystems, consider using `rsync` with progress flags:

```bash
rsync -a --remove-source-files --info=progress2 source/ destination/
```

- This shows a detailed progress bar and effectively "moves" files by copying and then deleting the source[^1_2].

---

### 3. Using `pv` (Pipe Viewer) for Piped Moves

- For moving a single large file, you can use `pv` to show a progress bar:

```bash
pv largefile > /destination/largefile && rm largefile
```

- For directories or multiple files, this method is less straightforward.

---

**Summary Table: Ways to Show `mv` Status**


| Method | Progress Bar | Per-File Status | Notes |
| :-- | :-- | :-- | :-- |
| `mv -v` | No | Yes | Built-in, simple, no progress percent |
| `progress` tool | Yes | Yes | Needs install, works for large files |
| `rsync --progress` | Yes | Yes | Not `mv`, but effective for big moves |
| `pv` + manual move | Yes | No | Best for single large files |


---

**Exit Status of `mv`**

- The `mv` command returns `0` on success and a non-zero value on failure. Note that some options like `-n` (no-clobber) do not treat "not moving" as an error, so the exit code may still be `0` even if no file was moved[^1_6].

---

**Conclusion**

- For simple feedback, use `mv -v`.
- For real-time progress, install and use the `progress` utility or use `rsync` as an alternative for large or cross-filesystem moves[^1_1][^1_3][^1_4].
- Always check the exit status with `$?` if you need to confirm success programmatically[^1_6].

<div style="text-align: center">⁂</div>

[^1_1]: https://unix.stackexchange.com/questions/2577/how-can-i-move-files-and-view-the-progress-e-g-with-a-progress-bar

[^1_2]: https://www.reddit.com/r/linuxquestions/comments/3m6nqp/how_do_i_see_a_progress_bar_while_using_the_mv/

[^1_3]: https://www.baeldung.com/linux/moving-files-showing-progress

[^1_4]: https://www.tecmint.com/show-progress-linux-commands/

[^1_5]: https://www.ionos.com/digitalguide/server/configuration/linux-mv-command/

[^1_6]: https://stackoverflow.com/questions/63293165/get-return-value-of-command-mv-n-linux

[^1_7]: https://phoenixnap.com/kb/mv-command-linux

[^1_8]: https://forums.freebsd.org/threads/how-do-i-see-progress-when-cp-or-mv-big-files.92496/

[^1_9]: https://superuser.com/questions/1714672/how-to-check-what-was-moved-when-using-mv-and-the-process-stops-due-to-permiss

[^1_10]: https://linuxcommandlibrary.com/man/mv

[^1_11]: https://linuxcommand.org/lc3_man_pages/mv1.html

[^1_12]: https://www.tutorialspoint.com/unix_commands/mv.htm

[^1_13]: https://www.rapidtables.com/code/linux/mv.html

