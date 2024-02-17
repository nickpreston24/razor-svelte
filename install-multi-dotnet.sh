cd ~/Downloads/
export DOTNET_ROOT=$HOME/.dotnet
mkdir -p "$DOTNET_ROOT"
echo "dotnet root: $DOTNET_ROOT"
tar zxf dotnet-sdk-6.0.403-linux-x64.tar.gz -C "$DOTNET_ROOT"
tar zxf dotnet-sdk-7.0.406-linux-x64.tar.gz -C "$DOTNET_ROOT"
export PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools

dotnet --list-runtimes
dotnet --list-sdks
