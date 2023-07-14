import asyncio, argparse, json, re, io
from collections import namedtuple
from typing import Iterable
import urllib.request

Package = namedtuple("Package", ["name", "version", "raw"])
placeholder = "{name:<30} {old_ver:10} {new_ver:<10}"


async def get_pypi_latest_version(package: Package) -> tuple[Package, Package]:
    base_package, *_ = package.name.split("[")
    with urllib.request.urlopen(f"https://pypi.org/pypi/{base_package}/json") as f:
        data = json.loads(f.read())
        version = data["info"]["version"]
    latest_package = Package(package.name, version, f"{package.name}=={version}")
    return package, latest_package


async def fetch_all_latest_packages(
    packages: Iterable[Package],
) -> list[tuple[Package, Package]]:
    fetch_list = (get_pypi_latest_version(package) for package in packages)
    new_packages = await asyncio.gather(*fetch_list)
    return [(old, new) for old, new in new_packages if old.version != new.version]


def read_packages(requirements_io: io.TextIOWrapper):
    for line in requirements_io:
        raw = line.strip()
        package_name, *_, version = re.split(r"<|=|>|\[\]", raw)
        yield Package(package_name, version, raw)
    requirements_io.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Check for updated dependencies in requirements file."
    )
    parser.add_argument(
        "filename",
        type=argparse.FileType("r"),
        help="requirement file",
    )
    parser.add_argument(
        "-u",
        "--update",
        action="store_true",
        help="also update requirement file with new versions.",
    )
    args = parser.parse_args()
    current_packages = list(read_packages(args.filename))
    latest_packages = asyncio.run(fetch_all_latest_packages(current_packages))
    if not latest_packages:
        print("Everything upto date.")
        exit(0)
    print(placeholder.format(name="NAME", old_ver="OLD_VER", new_ver="NEW_VER"))
    for old, new in latest_packages:
        if args.update:
            current_packages[current_packages.index(old)] = new
        print(
            placeholder.format(name=new.name, old_ver=old.version, new_ver=new.version)
        )
    if args.update:
        with open(args.filename.name, mode="w", encoding="utf_8", newline="\n") as f:
            f.writelines([raw + "\n" for *_, raw in current_packages])
