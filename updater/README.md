# Enhanced Paper Updater 🚀

An improved tool for updating academic paper metadata from arXiv, DBLP, and other sources. Available
in both Rust and Python implementations.

## 🆕 What's New

### Enhanced Rust Version (`main_improved.rs`)

**Improvements over original:**

- ✅ **Better similarity matching**: Uses Jaccard + Levenshtein combination instead of just
  Levenshtein
- ✅ **Improved error handling**: Comprehensive error handling with context
- ✅ **Better author extraction**: More robust parsing of author names
- ✅ **Progress tracking**: Shows progress with [X/Y] format
- ✅ **Statistics reporting**: Detailed summary of updates performed
- ✅ **Backup creation**: Automatically backs up files before modification
- ✅ **URL encoding**: Proper URL encoding for API queries
- ✅ **Timeouts**: Network timeouts to prevent hanging
- ✅ **Better normalization**: Improved title normalization for matching

### Python Version (`paper_updater.py`)

**Advanced features:**

- 🌟 **Multiple similarity algorithms**: Jaccard, sequence matching, combined scoring
- 🌟 **Async processing**: Faster with aiohttp async requests
- 🌟 **Comprehensive logging**: File + console logging with different levels
- 🌟 **Configuration file**: YAML-based configuration
- 🌟 **Dry-run mode**: Test updates without modifying files
- 🌟 **Command-line interface**: Rich CLI with multiple options
- 🌟 **Statistics tracking**: Detailed update statistics
- 🌟 **Extensible design**: Easy to add new data sources
- 🌟 **Better error recovery**: Graceful handling of API failures

## 🚀 Quick Start

### Using the Runner Script (Recommended)

```bash
# Run with Python (default, feature-rich with auto-fallback)
./run_updater.sh

# Run with Rust (fast, efficient)
./run_updater.sh rust

# Dry run to see what would be updated
./run_updater.sh python --dry-run

# Process only first 5 papers
./run_updater.sh --max-papers 5

# Verbose output
./run_updater.sh --verbose
```

**Note:** The Python version automatically detects if external dependencies (aiohttp, PyYAML) are
available. If not, it falls back to a simple version that uses only Python standard library.

### Manual Usage

#### Rust Version

```bash
# Build and run improved Rust version
cargo build --release --bin main_improved
cargo run --release --bin main_improved

# Or run original version
cargo run --bin main
```

#### Python Version

```bash
# Install dependencies (optional - will auto-fallback if not available)
pip3 install -r requirements.txt

# Run full-featured version
python3 paper_updater.py --help
python3 paper_updater.py --dry-run --max-papers 10 --verbose

# Or run simple version (no external dependencies required)
python3 simple_updater.py --help
python3 simple_updater.py --dry-run --max-papers 10 --verbose
```

## 📊 Features Comparison

| Feature                  | Original Rust | Enhanced Rust | Python (Full)   | Python (Simple) |
| ------------------------ | ------------- | ------------- | --------------- | --------------- |
| Basic arXiv/DBLP updates | ✅            | ✅            | ✅              | ✅              |
| Similarity matching      | Basic         | Advanced      | Advanced        | Advanced        |
| Error handling           | Basic         | Comprehensive | Comprehensive   | Good            |
| Progress tracking        | None          | Basic         | Advanced        | Basic           |
| Statistics               | None          | Basic         | Detailed        | Detailed        |
| Backup creation          | None          | ✅            | ✅              | ✅              |
| Dry-run mode             | None          | None          | ✅              | ✅              |
| Configuration            | Hardcoded     | Hardcoded     | YAML file       | Hardcoded       |
| Logging                  | Print only    | Enhanced      | File + Console  | Console         |
| CLI options              | None          | None          | Rich CLI        | Basic CLI       |
| Async processing         | Basic         | Basic         | Full async      | Synchronous     |
| External dependencies    | Rust crates   | Rust crates   | aiohttp, PyYAML | None            |

## 📁 File Structure

```text
updater/
├── src/
│   ├── main.rs              # Original Rust implementation
│   └── main_improved.rs     # Enhanced Rust implementation
├── paper_updater.py         # Full-featured Python implementation
├── simple_updater.py        # Simple Python (standard library only)
├── requirements.txt         # Python dependencies (optional)
├── config.yml              # Configuration file
├── run_updater.sh          # Smart runner script with auto-fallback
├── Cargo.toml              # Rust dependencies
└── README.md               # This file
```

## ⚙️ Configuration

The Python version supports configuration via `config.yml`:

```yaml
# Similarity thresholds
arxiv_threshold: 0.7 # Higher for arXiv
dblp_threshold: 0.6 # Lower for published papers

# Rate limiting
delay_seconds: 1.5 # Delay between requests

# Other options
create_backups: true
log_level: INFO
```

## 🔍 Similarity Matching

Both enhanced versions use improved similarity matching:

1. **Title Normalization**: Remove special characters, normalize case
2. **Jaccard Similarity**: Token overlap between titles
3. **Sequence Similarity**: Character-level similarity
4. **Combined Score**: Weighted combination of multiple metrics

## 📈 Statistics & Logging

The enhanced versions provide detailed statistics:

```
📊 UPDATE SUMMARY
==========================================
Papers processed: 150
ArXiv updates: 45
DBLP updates: 67
New publications: 23
Errors: 2
Skipped: 13
==========================================
```

## 🛠️ Development

### Adding New Data Sources

The Python version is designed for easy extension:

```python
async def update_from_new_source(self, paper: Paper) -> bool:
    # Implement new source logic
    pass

# Add to update_paper method
if await self.update_from_new_source(paper):
    self.stats.new_source_updates += 1
    updated = True
```

### Customizing Similarity

Adjust thresholds in configuration or modify similarity algorithms:

```python
# Custom similarity function
def custom_similarity(s1: str, s2: str) -> float:
    # Your custom logic here
    return score
```

## 🐛 Error Handling & Troubleshooting

Both versions include comprehensive error handling:

- Network timeouts and retries
- Invalid XML/JSON response handling
- File I/O error recovery
- Graceful degradation when APIs are unavailable

### Common Issues

**"pip3: command not found"**

- The runner script automatically handles this by trying multiple package managers
- Falls back to simple Python version that needs no external dependencies
- You can also run `python3 simple_updater.py` directly

**"No module named 'aiohttp'"**

- The runner script detects missing dependencies and uses the simple version
- Alternatively, install with: `python3 -m pip install aiohttp PyYAML --user`

**"Permission denied" when running script**

- Make sure the script is executable: `chmod +x run_updater.sh`

## 📄 License

Same as original project.

## 🤝 Contributing

1. Test your changes with `--dry-run` first
2. Add appropriate error handling
3. Update statistics tracking
4. Document new features

---

**Choose your tool:**

- **Rust Enhanced**: Fast, efficient, good error handling
- **Python**: Feature-rich, extensible, great for experimentation
